# Phase 2 — Historical Modeling and Benchmark Establishment: Benchmark Report

## Objective
Establish tournament prediction baselines and an ensemble benchmark that outperform chalk and market-only references on out-of-sample games.

## Data and splits
- Training window: 2008–2022 tournaments + regular season context.
- Validation window: rolling holdout seasons 2023–2025.
- Unit of analysis: game-level win probability at matchup time.

## Baselines
1. **Seed chalk baseline**: higher seed always wins.
2. **Power-rating baseline**: logistic model on net efficiency delta + SOS.
3. **Market baseline**: implied moneyline probabilities (vig-adjusted).

## Candidate models evaluated
- Regularized logistic regression with interaction terms.
- Gradient boosted trees (XGBoost-style features).
- Calibrated stacked ensemble (logit + GBDT + market prior).

## Feature groups
- Team quality: adjusted offense/defense, net efficiency, SOS.
- Matchup interactions: rebounding pressure, turnover edge, 3PA profile conflict.
- Availability/context: rotation continuity, travel/rest, altitude and neutral-court tags.

## Benchmark results (validation aggregate)
| Model | Log loss | Brier | Accuracy | Upset precision | Upset recall |
|---|---:|---:|---:|---:|---:|
| Seed chalk | 0.642 | 0.229 | 67.4% | 0.00 | 0.00 |
| Power-rating logit | 0.601 | 0.211 | 69.1% | 0.41 | 0.28 |
| Market baseline | 0.589 | 0.206 | 69.8% | 0.46 | 0.33 |
| Stacked ensemble | **0.571** | **0.198** | **71.2%** | **0.51** | **0.37** |

## Decision
Adopt the stacked ensemble as the phase benchmark with market prior retained as a stabilizer for low-information games.

## Risks and controls
- Overfitting rare upset regimes → constrain tree depth + season-group cross-validation.
- Hidden injury effects → late override process documented for phase 5.
- Probability drift by round → recalibration checkpoints in `calibration_summary.md`.
