# Phase 1 — Infrastructure and Data Acquisition: Feature Dictionary

## Purpose
This dictionary defines the minimum viable feature store for the March Madness research workflow. It standardizes naming, grain, and refresh rules so downstream modeling in Phase 2 can run reproducibly.

## Data model conventions
- **Primary season key:** `season` (YYYY)
- **Primary team key:** `team_id` (stable provider ID)
- **Primary game key:** `game_id` (provider game/event ID)
- **Snapshot timestamp:** `snapshot_ts_utc` (UTC ISO-8601)
- **Missing data policy:** numeric -> null; categorical -> `unknown`; booleans -> false unless explicitly true.

## Core entities

### 1) `dim_team`
**Grain:** one row per `team_id` per `season`.

| Column | Type | Description | Source | Refresh |
|---|---|---|---|---|
| `season` | int | Season year | schedule API | daily |
| `team_id` | string | Provider-stable team identifier | teams API | daily |
| `team_name` | string | Full team name | teams API | daily |
| `conference` | string | Current conference name | teams API | weekly |
| `coach_name` | string | Head coach | teams API | weekly |
| `home_city` | string | Team city | teams API | monthly |
| `latitude` | float | Campus geo latitude | geocoding | monthly |
| `longitude` | float | Campus geo longitude | geocoding | monthly |

### 2) `fct_game_team`
**Grain:** one row per `game_id` + `team_id` (team-game level).

| Column | Type | Description | Source | Refresh |
|---|---|---|---|---|
| `game_id` | string | Unique game ID | games API | intra-day |
| `season` | int | Season year | games API | intra-day |
| `game_date_utc` | timestamp | Tip-off datetime | games API | intra-day |
| `team_id` | string | Team in this record | games API | intra-day |
| `opponent_team_id` | string | Opponent team | games API | intra-day |
| `site_type` | string | `home`/`away`/`neutral` | games API | intra-day |
| `points_for` | int | Team points scored | box score API | post-game |
| `points_against` | int | Opponent points | box score API | post-game |
| `possessions_est` | float | Estimated possessions | derived | post-game |
| `off_eff` | float | Points per 100 possessions | derived | post-game |
| `def_eff` | float | Allowed points per 100 possessions | derived | post-game |
| `result` | string | `W` or `L` | derived | post-game |

### 3) `fct_team_form`
**Grain:** one row per `team_id` per `snapshot_ts_utc`.

| Column | Type | Description | Source | Refresh |
|---|---|---|---|---|
| `team_id` | string | Team identifier | derived | daily |
| `snapshot_ts_utc` | timestamp | Feature snapshot timestamp | pipeline | daily |
| `games_last_10` | int | Number of games in window | derived | daily |
| `win_pct_last_10` | float | Win percentage last 10 games | derived | daily |
| `off_eff_last_10` | float | Rolling 10-game offensive efficiency | derived | daily |
| `def_eff_last_10` | float | Rolling 10-game defensive efficiency | derived | daily |
| `net_eff_last_10` | float | `off_eff_last_10 - def_eff_last_10` | derived | daily |
| `sos_last_10` | float | Strength of schedule in window | derived | daily |

### 4) `fct_market_line`
**Grain:** one row per `game_id` + `book` + `snapshot_ts_utc`.

| Column | Type | Description | Source | Refresh |
|---|---|---|---|---|
| `game_id` | string | Game identifier | odds provider | hourly |
| `book` | string | Sportsbook/source | odds provider | hourly |
| `snapshot_ts_utc` | timestamp | Odds pull timestamp | ingestion | hourly |
| `spread` | float | Spread from favorite perspective | odds provider | hourly |
| `total` | float | Over/under total | odds provider | hourly |
| `moneyline_fav` | int | Favorite moneyline | odds provider | hourly |
| `moneyline_dog` | int | Underdog moneyline | odds provider | hourly |
| `implied_win_prob_fav` | float | Vig-adjusted favorite probability | derived | hourly |

### 5) `fct_injury_status`
**Grain:** one row per `team_id` + `player_id` + `snapshot_ts_utc`.

| Column | Type | Description | Source | Refresh |
|---|---|---|---|---|
| `team_id` | string | Team identifier | injury feed | daily |
| `player_id` | string | Player identifier | injury feed | daily |
| `snapshot_ts_utc` | timestamp | Pull timestamp | ingestion | daily |
| `injury_status` | string | `out`/`questionable`/`probable`/`available` | injury feed | daily |
| `position` | string | Player position | roster API | weekly |
| `minutes_share` | float | Season % of team minutes | derived | daily |
| `bpm_estimate` | float | Impact proxy | derived | daily |
| `availability_impact_score` | float | Availability-adjusted impact | derived | daily |

## Derived feature definitions (model-ready)
- `travel_miles_last_7d`: great-circle distance sum for games in trailing 7 days.
- `rest_days`: days between current game and prior game.
- `neutral_site_flag`: binary from `site_type == neutral`.
- `conference_tournament_flag`: true for conference tournament games.
- `market_model_delta`: model spread minus market spread.
- `injury_weighted_net_eff`: net efficiency after player availability adjustment.

## Quality gates before Phase 2 handoff
1. All five core entities populated for at least the last 5 seasons.
2. Join coverage from `fct_game_team` to `dim_team` >= 99.5%.
3. Null rates under thresholds listed in validation report.
4. Timezone normalized to UTC for all event and snapshot timestamps.
5. Data dictionary version tagged in git with ledger timestamp.
