"""Repeatable comparisons of PI gain choices."""
import argparse
import csv
from pathlib import Path

from .__main__ import KI, KP, analyze


def compare(duration):
    cases = (
        ("Baseline", KP, KI),
        ("Half proportional gain", KP / 2, KI),
        ("Double proportional gain", 2 * KP, KI),
        ("Double integral gain", KP, 2 * KI),
        ("Near stability boundary", KP, 1.8 * KP),
        ("At stability boundary", KP, 2 * KP),
        ("Beyond stability boundary", KP, 2.2 * KP),
    )
    return [{"case": name, **analyze(kp, ki, duration)[0]} for name, kp, ki in cases]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--duration", type=float, default=160)
    parser.add_argument("--csv", type=Path, help="Optional destination for the comparison")
    args = parser.parse_args()
    try:
        rows = compare(args.duration)
    except ValueError as error:
        parser.error(str(error))
    for row in rows:
        print(f"{row['case']:27} stable={row['stable']!s:5} "
              f"overshoot={row['overshoot_pct']} settling={row['settling_time_s']}")
    if args.csv:
        args.csv.parent.mkdir(parents=True, exist_ok=True)
        with args.csv.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=rows[0])
            writer.writeheader()
            writer.writerows(rows)


if __name__ == "__main__":
    main()
