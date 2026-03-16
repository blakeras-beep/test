# Phase 4 — Selection Sunday Ingestion and Provisional Forecasting: Provisional Brackets

## Workflow executed
1. Ingested official bracket tree and seed placements.
2. Generated game-level probabilities for all first-round matchups.
3. Simulated full tournament paths (100,000 bracket draws) under dependency constraints.
4. Produced three provisional bracket variants:
   - **Baseline EV-max** (highest expected points)
   - **Balanced risk** (moderate upset exposure)
   - **Contrarian pool** (for large-field leverage)

## Provisional strategy notes
- Protected 1 and 2 seeds where model edge remained >= 12 points probability.
- Concentrated upset selections in archetype-approved 10/7, 11/6, and select 12/5 profiles.
- Avoided correlated longshot chains that collapse Final Four probability mass.

## Next gate to phase 5
- Refresh injury and rotation certainty windows.
- Apply latest market snapshots and rerank sensitive games.
- Select single official bracket with traceable rationale.
