
from pathlib import Path
import argparse
import json

import numpy as np
from scipy import optimize, signal

KP = 2.0248861318247524
KI = 0.06465479767351344


def analyze(kp=KP, ki=KI, duration=160.0):
    """Analyze the PI-controlled plant 1 / [s(s + 2)]."""
    if not all(np.isfinite(x) and x > 0 for x in (kp, ki, duration)):
        raise ValueError("Gains and duration must be positive and finite.")
    denominator = [1, 2, kp, ki]
    poles = np.roots(denominator)
    stable = bool(ki < 2 * kp)
    loop = signal.TransferFunction([kp, ki], [1, 2, 0, 0])
    closed = signal.TransferFunction([kp, ki], denominator)
    t = np.linspace(0, duration, 16001)
    _, y = signal.step(closed, T=t)
    crossover = np.sqrt(optimize.brentq(
        lambda x: x * x * (x + 4) - kp * kp * x - ki * ki,
        0, max(1, 2 * kp, 2 * ki)
    ))
    phase = np.degrees(np.arctan2(kp * crossover, ki) - np.pi - np.arctan(crossover / 2))
    metrics = dict(stable=stable, kp=kp, ki=ki, duration_s=duration,
                   gain_crossover_rad_s=float(crossover), phase_margin_deg=float(180 + phase),
                   gain_margin="infinite" if stable else "not reported",
                   sampled_final=float(y[-1]), steady_state_error=0.0 if stable else None,
                   rise_time_s=None, settling_time_s=None, overshoot_pct=None, peak_time_s=None)
    if stable:
        def crossing(level):
            hits = np.flatnonzero(y >= level)
            if not hits.size:
                return None
            i = hits[0]
            return float(t[i - 1] + (t[i] - t[i - 1]) *
                         (level - y[i - 1]) / (y[i] - y[i - 1]))
        low, high = crossing(.1), crossing(.9)
        outside = np.flatnonzero(np.abs(y - 1) > .02)
        peak = int(y.argmax())
        metrics.update(rise_time_s=high-low if high is not None and low is not None else None,
                       settling_time_s=float(t[outside[-1]+1]) if outside.size and outside[-1]+1 < len(t) else None,
                       overshoot_pct=float(max(0, y[peak]-1)*100), peak_time_s=float(t[peak]))
    return metrics, t, y, poles, loop, closed


def main():
    parser = argparse.ArgumentParser(description="Analyze a PI controller with unity feedback.")
    parser.add_argument("--kp", type=float, default=KP)
    parser.add_argument("--ki", type=float, default=KI)
    parser.add_argument("--duration", type=float, default=160.0, help="simulation horizon in seconds")
    parser.add_argument("--output", type=Path, help="write a JSON report and response plots")
    args = parser.parse_args()
    try:
        metrics, t, y, poles, loop, closed = analyze(args.kp, args.ki, args.duration)
    except ValueError as error:
        parser.error(str(error))
    try:
        report = json.dumps(metrics, indent=2, allow_nan=False)
    except ValueError:
        parser.error("The response overflowed. Try a shorter duration or smaller gains.")
    print(report)
    if args.output:
        from .plots import export_plots
        args.output.mkdir(parents=True, exist_ok=True)
        (args.output / "metrics.json").write_text(report + "\n", encoding="utf-8")
        np.savetxt(args.output / "step_response.csv", np.column_stack((t, y, 1 - y)),
                   delimiter=",", header="time_s,output,tracking_error", comments="")
        export_plots(args.output, t, y, poles, loop, closed, -args.ki/args.kp)


if __name__ == "__main__":
    main()

