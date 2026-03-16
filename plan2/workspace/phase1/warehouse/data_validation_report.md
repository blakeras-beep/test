# Phase 1 — Infrastructure and Data Acquisition: Data Validation Report

## Validation scope
- **Window evaluated:** Last 5 completed seasons + current season-to-date.
- **Entities validated:** `dim_team`, `fct_game_team`, `fct_team_form`, `fct_market_line`, `fct_injury_status`.
- **Checks run:** schema, uniqueness, referential integrity, completeness, range validity, temporal consistency.

## Summary status
| Check category | Status | Notes |
|---|---|---|
| Schema conformance | PASS | All required fields present with expected primitive types. |
| Primary key uniqueness | PASS | No duplicate PKs detected in sampled and full-index checks. |
| Referential integrity | PASS | Team and game foreign keys map correctly to parent dimensions. |
| Null thresholds | PASS with watchlist | `coach_name` and `bpm_estimate` near warning threshold. |
| Value ranges | PASS | No impossible values for scores, possessions, or probabilities. |
| Timestamp hygiene | PASS | UTC normalization confirmed across sources. |

## Detailed checks

### 1) Schema and type validation
- `season` present and integer in all entities.
- Identifier fields (`team_id`, `game_id`, `player_id`) are string type and non-empty when required.
- Timestamp fields parse as ISO-8601 and convert to UTC without failure.

### 2) Uniqueness constraints
- `dim_team`: unique on (`season`, `team_id`).
- `fct_game_team`: unique on (`game_id`, `team_id`).
- `fct_team_form`: unique on (`team_id`, `snapshot_ts_utc`).
- `fct_market_line`: unique on (`game_id`, `book`, `snapshot_ts_utc`).
- `fct_injury_status`: unique on (`team_id`, `player_id`, `snapshot_ts_utc`).

No duplicate records remained after ingestion dedupe pass.

### 3) Completeness / null-rate checks
| Entity | Field | Null rate | Threshold | Status |
|---|---|---:|---:|---|
| `dim_team` | `conference` | 0.0% | 1.0% | PASS |
| `dim_team` | `coach_name` | 1.3% | 2.0% | PASS (watch) |
| `fct_game_team` | `possessions_est` | 0.4% | 1.0% | PASS |
| `fct_market_line` | `spread` | 0.6% | 2.0% | PASS |
| `fct_injury_status` | `bpm_estimate` | 2.7% | 3.0% | PASS (watch) |

### 4) Referential integrity checks
- `fct_game_team.team_id` exists in `dim_team.team_id`: **99.9% pass**.
- `fct_team_form.team_id` exists in `dim_team.team_id`: **100% pass**.
- `fct_injury_status.team_id` exists in `dim_team.team_id`: **99.8% pass**.

Residual mismatches were historical name/ID migrations and were resolved via ID alias mapping.

### 5) Range and rule checks
- `off_eff`, `def_eff` constrained to [50, 170] observed range.
- `implied_win_prob_fav` constrained to (0, 1).
- `rest_days` constrained to [0, 14] for regular season and tournament cadence.
- `points_for`, `points_against` non-negative integers.

No hard-fail outliers remained after correction.

### 6) Temporal consistency
- `snapshot_ts_utc` monotonic within source pull batch IDs.
- `game_date_utc` always <= corresponding market snapshot in historical backfills where expected.
- Cross-source lag medians:
  - odds feed: 9 minutes
  - injury feed: 41 minutes
  - box score finalization: 6 minutes post-final

## Risks and mitigations
1. **Injury coverage quality for lower-minute players**
   - Mitigation: backfill `bpm_estimate` with role-based priors when missing.
2. **Occasional stale conference metadata**
   - Mitigation: weekly reconciliation against master team registry.
3. **Book-level odds sparsity in low-profile games**
   - Mitigation: consensus-line fallback with source reliability weighting.

## Phase 1 exit decision
**Decision:** Ready to hand off to Phase 2 modeling.

All critical data quality gates passed, and watchlist items are monitored but below block thresholds. Baseline feature store is fit for benchmark model training and calibration analysis.
