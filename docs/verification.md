# Verification notes

The baseline uses the original proportional and integral gains. The Routh stability condition is Ki < 2 Kp for positive gains. Compare the closed-loop poles with the analytical polynomial and check the unit step using SciPy. The gain crossover solves the unity-magnitude equation for the open loop.

The 2% settling estimate is the first sampled point after the last out-of-band sample. The signal must stay within the band for the rest of the simulated horizon. Extend the horizon near marginal stability. The rise time uses linear interpolation at the first threshold crossings. An unavailable measurement is reported as null.

This is a linear simulation without hardware measurements, disturbances, saturation, or noise. No external dataset is required.
