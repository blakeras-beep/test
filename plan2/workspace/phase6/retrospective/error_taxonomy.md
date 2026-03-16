# Phase 6 — Post-Mortem and Model Revision: Error Taxonomy

## Purpose
Classify misses by root cause to separate variance from process defects.

## Taxonomy
1. **Unforecastable variance**
   - Extreme single-game shooting tails.
   - Overtime coinflip possessions.
2. **Information lag errors**
   - Late injury/availability updates not captured before freeze.
3. **Feature blind spots**
   - Underspecified matchup interactions (e.g., foul-draw asymmetry).
4. **Calibration errors**
   - Overconfidence in heavy favorites beyond observed reliability.
5. **Portfolio construction errors**
   - Over-concentrated upset allocations in same region path.

## Scoring protocol
- Assign every incorrect pick exactly one primary root cause.
- Tag secondary contributors where applicable.
- Roll up counts by round and confidence tier.
