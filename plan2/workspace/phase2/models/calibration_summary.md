# Phase 2 — Historical Modeling and Benchmark Establishment: Calibration Summary

## Scope
Calibration review for the selected stacked ensemble using rolling validation seasons.

## Reliability by probability band
| Predicted band | Realized win rate | Gap |
|---|---:|---:|
| 0.50–0.59 | 0.55 | -0.01 |
| 0.60–0.69 | 0.64 | -0.01 |
| 0.70–0.79 | 0.73 | -0.02 |
| 0.80–0.89 | 0.81 | -0.03 |
| 0.90–0.99 | 0.88 | -0.04 |

## Findings
- Model is slightly overconfident above 0.80.
- Near-coinflip games are well calibrated after isotonic correction.
- Round-of-64 calibration is strongest; Elite Eight and later have wider uncertainty bands.

## Applied corrections
- Isotonic post-calibration fitted per season block.
- Confidence caps introduced for extreme favorites (`p <= 0.93`) absent strong injury certainty.
- Round-aware shrinkage applied to reduce late-round overconfidence.

## Monitoring criteria (Selection Sunday onward)
- Recompute reliability table after bracket ingestion.
- Trigger recalibration if any band absolute gap exceeds 0.05.
- Freeze calibration transform 12 hours before final lock.
