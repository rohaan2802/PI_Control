<div align="center">

# PI Control

**Step response and stability of a PI-controlled plant**

[![Python](assets/badges/python.svg)](#how-to-run) [![PI control](assets/badges/pi.svg)](#model-and-stability) [![24 figures](assets/badges/figures.svg)](#screenshots)

[![SciPy](assets/badges/scipy.svg)](#how-the-metrics-work) [![Stability](assets/badges/stability.svg)](#model-and-stability) [![Gain Lab](assets/badges/gain-lab.svg)](#interactive-gain-lab) [![CSV + JSON](assets/badges/exports.svg)](#reproduce-and-export)

</div>

---

## Live Links

| What | Link |
| --- | --- |
| Repository | [https://github.com/rohaan2802/PI_Control](https://github.com/rohaan2802/PI_Control) |
| GitHub Pages | [https://rohaan2802.github.io/PI_Control/](https://rohaan2802.github.io/PI_Control/) |
| SciPy LTI reference | [https://docs.scipy.org/doc/scipy/reference/signal.html#continuous-time-linear-systems](https://docs.scipy.org/doc/scipy/reference/signal.html#continuous-time-linear-systems) |

---

## Table of Contents

1. [Live Links](#live-links)
2. [Overview](#overview)
3. [What's Inside](#whats-inside)
4. [Model and Stability](#model-and-stability)
5. [Baseline Results](#baseline-results)
6. [How the Metrics Work](#how-the-metrics-work)
7. [Gain Experiments](#gain-experiments)
8. [Limitations](#limitations)
9. [Folder Structure](#folder-structure)
10. [How to Run](#how-to-run)
11. [Interactive Gain Lab](#interactive-gain-lab)
12. [Reproduce and Export](#reproduce-and-export)
13. [Screenshots](#screenshots)
14. [About the Author](#about-the-author)

## Overview

A Python study of a proportional–integral controller for the damped plant G(s) = 1/[s(s + 2)]. It examines reference tracking, closed-loop stability, and open-loop frequency margins.

## What's Inside

| Resource | File |
| --- | --- |
| Original assignment script | [original_pi_controller.py](docs/original_pi_controller.py) (reference copy) |
| Analysis and CLI | [__main__.py](pi_control/__main__.py) |
| Plot exporters | [plots.py](pi_control/plots.py) |
| Verification notes | [verification.md](docs/verification.md) |
| Gain comparison CLI | [compare.py](pi_control/compare.py) |
| Python project file | [pyproject.toml](pyproject.toml) |
| Browser simulator | [gain_lab.js](assets/gain_lab.js) |
| Dependencies | [requirements.txt](requirements.txt) |
| Website preview | [index.html](index.html) |

## Model and Stability

Under negative unity feedback, L(s) = (Kp s + Ki)/[s²(s + 2)] and T(s) = (Kp s + Ki)/(s³ + 2s² + Kp s + Ki). With positive gains, the Routh array gives Ki < 2 Kp. The controller zero is −Ki/Kp.

### From the plant to the characteristic polynomial

The plant has one integrator and one pole at −2. The controller adds another open-loop integrator and a zero at −Ki/Kp. Substituting the loop into the unity feedback equation gives the characteristic polynomial [1, 2, Kp, Ki]. The first column of its Routh array is 1, 2, (2 Kp − Ki)/2, Ki. Positive gains on the boundary Ki = 2 Kp give imaginary-axis poles, so the CLI classifies that case as not asymptotically stable.

## Baseline Results

The original gains are Kp = 2.02488613 and Ki = 0.06465480. The 160 s simulation gives 1.441 s rise time, 7.738% overshoot, 16.29 s settling time, and 63.303° phase margin. The stable closed-loop DC gain is one. Gain margin is infinite for the baseline loop.

## How the Metrics Work

Rise time uses the first 10% and 90% crossings of the unit reference, with interpolation between samples. Overshoot is measured relative to the unit target. Settling uses the last sample outside the ±2% band. Steady-state error comes from DC gain. Stability margins come from the open loop, while closed-loop magnitude and phase describe reference tracking.

### Reading a report

| Field | How to interpret it |
| --- | --- |
| sampled_final | The simulated output at the final time, which can differ from the analytical limit |
| peak_time_s | The sampled time of the largest response in the simulation window |
| settling_time_s | The first sample after the last excursion outside the 2% band. A null value means no settling time was established. |
| gain_crossover_rad_s | Frequency where the open-loop magnitude is one |
| phase_margin_deg | Angular distance to −180° at unity gain |

## Gain Experiments

The gallery holds one gain fixed while sweeping the other. It also shows the poles and unit-step responses around the Routh boundary. These sweeps illustrate sensitivity to the gains. They do not automate controller tuning.

## Limitations

This model assumes a linear continuous-time plant, ideal feedback, a unit step, and zero initial conditions. There is no hardware validation. Finite sampling limits peak and settling-time precision, especially near the stability boundary.

## Folder Structure

~~~text
PI_Control/
├── pi_control/      Analysis and export code
├── docs/            Verification notes
├── assets/          24 figures, previews and site assets
├── pyproject.toml    Installable project configuration
├── requirements.txt
├── index.html
└── README.md
~~~

## How to Run

~~~powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python -m pi_control --output outputs
~~~

Omit the output flag to print the report only. Use --kp, --ki, or --duration to compare another configuration. Output files are generated on demand.

## Interactive Gain Lab

Open the [Gain Lab](index.html#gain-lab) and vary Kp or the ratio Ki / (2 Kp). The chart compares the selected gains with the original controller and the unit reference. Set the ratio to 1 with **Set boundary**, or restore the original gains with **Reset to baseline**.

For the unit step, the browser solves y‴ + 2y″ + Kp y′ + Ki y = Ki. The initial output and first derivative are zero, and the second derivative just after the step is Kp. The browser uses fourth-order Runge–Kutta with a 0.01 s step over 30 s. The Python command-line study uses SciPy and defaults to a 160 s window.

## Reproduce and Export

~~~powershell
python -m pi_control --output outputs/baseline
python -m pi_control.compare --csv outputs/gain_comparison.csv
~~~

The first command exports metrics.json, step_response.csv, step_response.png, pole_zero.png, open_loop_bode.png and closed_loop_bode.png. The CSV columns are time in seconds, output, and signed tracking error. The comparison command exports seven configurations with their actual gains and measured results.

| Gain choice | Stability | Overshoot | 2% settling |
| --- | --- | ---: | ---: |
| Original PI gains | Stable | 7.74% | 16.29 s |
| Half Kp | Stable | 9.92% | 30.68 s |
| Double Kp | Stable | 17.62% | 3.72 s |
| Double Ki | Stable | 10.87% | 19.30 s |
| Ki = 1.8 Kp | Stable | 94.64% | 110.01 s |
| Ki = 2 Kp | Marginal | — | — |
| Ki = 2.2 Kp | Unstable | — | — |

This comparison uses the same 160 s horizon. Doubling Kp settles sooner in this model at the cost of more overshoot. Moving Ki near the boundary leaves the stable response weakly damped.

To install the project after activating a Python 3.14 virtual environment, run python -m pip install -e . in the project root. The configuration in [pyproject.toml](pyproject.toml) adds the pi-control and pi-compare console commands. The Python module commands work directly from the repository with the dependencies installed.

## Screenshots

24 captures on consistent 1440 × 900 frames. Select any preview to open the full image.

### Model

[Plant and PI controller](#plant-and-pi-controller) · [Open-loop transfer function](#open-loop-transfer-function) · [Closed-loop transfer function](#closed-loop-transfer-function) · [Routh stability condition](#routh-stability-condition) · [Baseline poles and zero](#baseline-poles-and-zero) · [Slow pole and zero close-up](#slow-pole-and-zero-close-up) · [Model assumptions](#model-assumptions) · [Command-line workflow](#command-line-workflow)

### Step

[Full unit-step response](#full-unit-step-response) · [First peak close-up](#first-peak-close-up) · [Rise-time thresholds](#rise-time-thresholds) · [Settling inside the 2% band](#settling-inside-the-2-band) · [Baseline step metrics](#baseline-step-metrics) · [Tracking error over time](#tracking-error-over-time) · [Why the horizon matters](#why-the-horizon-matters)

### Frequency

[Open-loop magnitude](#open-loop-magnitude) · [Open-loop phase](#open-loop-phase) · [Closed-loop magnitude](#closed-loop-magnitude) · [Closed-loop phase](#closed-loop-phase) · [Baseline stability margins](#baseline-stability-margins)

### Tradeoffs

[Proportional gain sweep](#proportional-gain-sweep) · [Integral gain sweep](#integral-gain-sweep) · [Pole movement as Ki rises](#pole-movement-as-ki-rises) · [Across the stability boundary](#across-the-stability-boundary)

### Plant and PI controller

[![Plant and PI controller](assets/thumbs/01-plant-and-pi-controller.webp)](assets/screenshots/01-plant-and-pi-controller.png)

Continuous-time transfer functions from the original assignment.

### Open-loop transfer function

[![Open-loop transfer function](assets/thumbs/02-open-loop-transfer-function.webp)](assets/screenshots/02-open-loop-transfer-function.png)

The loop combines the controller and plant. Its response determines the stability margins.

### Closed-loop transfer function

[![Closed-loop transfer function](assets/thumbs/03-closed-loop-transfer-function.webp)](assets/screenshots/03-closed-loop-transfer-function.png)

Unity feedback gives a third-order characteristic polynomial.

### Routh stability condition

[![Routh stability condition](assets/thumbs/04-routh-stability-condition.webp)](assets/screenshots/04-routh-stability-condition.png)

For positive gains, strict stability requires Ki < 2 Kp.

### Full unit-step response

[![Full unit-step response](assets/thumbs/05-full-unit-step-response.webp)](assets/screenshots/05-full-unit-step-response.png)

The long horizon shows the slow approach to the analytical final value.

### First peak close-up

[![First peak close-up](assets/thumbs/06-first-peak-close-up.webp)](assets/screenshots/06-first-peak-close-up.png)

The baseline peak occurs at about 3.14 s.

### Rise-time thresholds

[![Rise-time thresholds](assets/thumbs/07-rise-time-thresholds.webp)](assets/screenshots/07-rise-time-thresholds.png)

The first crossings of 0.1 and 0.9 define the 10–90% rise time.

### Settling inside the 2% band

[![Settling inside the 2% band](assets/thumbs/08-settling-inside-the-2-band.webp)](assets/screenshots/08-settling-inside-the-2-band.png)

The estimated settling time is 16.29 s on the baseline grid.

### Baseline step metrics

[![Baseline step metrics](assets/thumbs/09-baseline-step-metrics.webp)](assets/screenshots/09-baseline-step-metrics.png)

Metrics use the unit target as the steady-state value.

### Tracking error over time

[![Tracking error over time](assets/thumbs/10-tracking-error-over-time.webp)](assets/screenshots/10-tracking-error-over-time.png)

The signed difference between the unit target and the output.

### Baseline poles and zero

[![Baseline poles and zero](assets/thumbs/11-baseline-poles-and-zero.webp)](assets/screenshots/11-baseline-poles-and-zero.png)

The three poles lie in the left half-plane.

### Slow pole and zero close-up

[![Slow pole and zero close-up](assets/thumbs/12-slow-pole-and-zero-close-up.webp)](assets/screenshots/12-slow-pole-and-zero-close-up.png)

The real pole and controller zero are close together but distinct.

### Open-loop magnitude

[![Open-loop magnitude](assets/thumbs/13-open-loop-magnitude.webp)](assets/screenshots/13-open-loop-magnitude.png)

The gain crossover is where the open-loop magnitude reaches 0 dB.

### Open-loop phase

[![Open-loop phase](assets/thumbs/14-open-loop-phase.webp)](assets/screenshots/14-open-loop-phase.png)

The open-loop phase is evaluated at gain crossover to obtain phase margin.

### Closed-loop magnitude

[![Closed-loop magnitude](assets/thumbs/15-closed-loop-magnitude.webp)](assets/screenshots/15-closed-loop-magnitude.png)

This response describes reference tracking across frequencies.

### Closed-loop phase

[![Closed-loop phase](assets/thumbs/16-closed-loop-phase.webp)](assets/screenshots/16-closed-loop-phase.png)

Closed-loop phase is separate from the open-loop stability margins.

### Baseline stability margins

[![Baseline stability margins](assets/thumbs/17-baseline-stability-margins.webp)](assets/screenshots/17-baseline-stability-margins.png)

An infinite gain margin indicates no finite −180° phase crossover in the baseline loop.

### Proportional gain sweep

[![Proportional gain sweep](assets/thumbs/18-proportional-gain-sweep.webp)](assets/screenshots/18-proportional-gain-sweep.png)

Simulated responses at half, baseline, and double proportional gain with Ki held fixed.

### Integral gain sweep

[![Integral gain sweep](assets/thumbs/19-integral-gain-sweep.webp)](assets/screenshots/19-integral-gain-sweep.png)

Simulated responses at half, baseline, and double integral gain with Kp held fixed.

### Pole movement as Ki rises

[![Pole movement as Ki rises](assets/thumbs/20-pole-movement-as-ki-rises.webp)](assets/screenshots/20-pole-movement-as-ki-rises.png)

Blue points are stable and orange points lie beyond the Routh boundary.

### Across the stability boundary

[![Across the stability boundary](assets/thumbs/21-across-the-stability-boundary.webp)](assets/screenshots/21-across-the-stability-boundary.png)

Responses on either side of Ki = 2 Kp illustrate why the strict inequality matters.

### Model assumptions

[![Model assumptions](assets/thumbs/22-model-assumptions.webp)](assets/screenshots/22-model-assumptions.png)

The study uses an ideal continuous-time plant and a linear controller.

### Why the horizon matters

[![Why the horizon matters](assets/thumbs/23-why-the-horizon-matters.webp)](assets/screenshots/23-why-the-horizon-matters.png)

A finite sample and the true steady-state limit answer different questions.

### Command-line workflow

[![Command-line workflow](assets/thumbs/24-command-line-workflow.webp)](assets/screenshots/24-command-line-workflow.png)

Reproduce the study and export plots or the machine-readable report.

## About the Author

Mohammad Rohaan · Control systems coursework.

[GitHub profile](https://github.com/rohaan2802)
