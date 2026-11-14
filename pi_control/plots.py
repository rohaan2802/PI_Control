
"""Plot the step response, pole-zero map, and frequency response."""
import numpy as np
from scipy import signal


def step_plot(ax, t, y, limit=None):
    mask = t <= limit if limit is not None else slice(None)
    ax.plot(t[mask], y[mask], color="#195083", lw=2, label="Closed-loop output")
    ax.axhline(1, color="#52717d", ls="--", label="Unit reference")
    ax.set(xlabel="Time (s)", ylabel="Output")
    ax.legend(loc="best")


def pole_plot(ax, poles, zero):
    ax.axvline(0, color="#637889", ls="--", lw=1)
    ax.axhline(0, color="#637889", lw=1)
    ax.scatter(poles.real, poles.imag, marker="x", s=90, color="#195083", label="Poles")
    ax.scatter([zero], [0], facecolors="none", edgecolors="#b35925", s=90, label="Controller zero")
    ax.margins(.12)
    ax.set(xlabel="Real part (1/s)", ylabel="Imaginary part (rad/s)")
    ax.legend()


def frequency_plot(ax, system, component):
    w = np.geomspace(.001, 100, 700)
    _, h = signal.freqresp(system, w=w)
    magnitude = component == "magnitude"
    ax.semilogx(w, 20 * np.log10(np.abs(h)) if magnitude else
                np.degrees(np.unwrap(np.angle(h))), color="#195083", lw=2)
    ax.set(xlabel="Frequency (rad/s)", ylabel="Magnitude (dB)" if magnitude else "Phase (degrees)")


def export_plots(output, t, y, poles, loop, closed, zero):
    import matplotlib
    matplotlib.use("Agg")
    from matplotlib import pyplot as plt
    for name, draw in (
        ("step_response", lambda ax: step_plot(ax, t, y)),
        ("pole_zero", lambda ax: pole_plot(ax, poles, zero)),
        ("open_loop_bode", None),
        ("closed_loop_bode", None),
    ):
        if draw is None:
            fig, axes = plt.subplots(2, 1, figsize=(9, 7), layout="constrained")
            system = loop if name == "open_loop_bode" else closed
            frequency_plot(axes[0], system, "magnitude")
            frequency_plot(axes[1], system, "phase")
            fig.suptitle(name.replace("_", " ").title())
        else:
            fig, ax = plt.subplots(figsize=(9, 5), layout="constrained")
            draw(ax)
            ax.set_title(name.replace("_", " ").title())
        for ax in fig.axes:
            ax.grid(alpha=.25)
        fig.savefig(output / (name + ".png"), dpi=150)
        plt.close(fig)

