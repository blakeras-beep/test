# March Madness Perfect Bracket: Research Architecture & Methodology Blueprint

## Framing the Objective and Epistemic Boundaries

The core question is how to design a research system that maximizes the probability of correctly predicting all 67 games in the 2026 NCAA Men’s Tournament while remaining honest about uncertainty. The approach must separate two truths that are often conflated: first, perfect prediction is vanishingly unlikely, and second, process quality can still materially improve expected accuracy across all rounds. This architecture therefore optimizes for calibrated game-level probabilities, disciplined bracket construction under dependency constraints, and reproducibility year over year.

Methodologically, the blueprint treats each game as a conditional forecasting task embedded inside a tournament graph. The winner of one node determines features and matchup context at downstream nodes, so the process cannot be purely local; it requires global coherence. The research program uses a layered evidence model: structural team quality, matchup interaction terms, human/psychological variables, market information, and late-breaking availability news. Any signal admitted into the pipeline must pass three tests: historical predictive lift, out-of-sample robustness, and timeliness relative to pick lock deadlines.

Assumptions include continuing availability of major public metrics and basic odds/market data by 2026. Key risks include data latency, hidden injuries, one-game variance (especially three-point volatility), and regime shifts from transfer portal dynamics. This framing depends on Sections 1, 3, 6, and 9 because taxonomy, metric hierarchy, upset logic, and model architecture jointly define what counts as actionable evidence.

## 1) Data Taxonomy: What to Collect, Why It Matters, and How to Control Noise

The core question is which information classes materially increase win-probability estimation for tournament games. The approach organizes data into five tiers: foundational team strength, stylistic matchup interactions, player availability/rotation integrity, contextual game conditions, and behavioral/decision quality proxies.

Foundational team strength includes adjusted offensive and defensive efficiency, strength of schedule decomposition (overall, top-50 only, away/neutral only), tempo-adjusted net rating, and shot-quality profiles on both ends. Sources are KenPom, Torvik, EvanMiya, TeamRankings, and publicly available play-by-play repositories. Reliability is high for full-season possession-based metrics, but reliability drops when roster states changed midseason; therefore all season-long metrics require recency reweighting and injury-aware adjustment.

Stylistic matchup data includes rim frequency allowed versus rim attack rate, pick-and-roll ball-handler efficiency, transition frequency and transition defense suppression, offensive rebounding pressure versus box-out quality, turnover creation versus ball security, and three-point attempt mix (above-the-break vs corner). These features are often signal disguised as complexity: they can explain why equally rated teams diverge in head-to-head outcomes. Sources include Synergy-style datasets where available, shot-location splits from public APIs, and team-level proxies when play-type data is inaccessible.

Player availability and rotation integrity include starter minutes continuity, on/off differential for top two creators, foul-draw/foul-avoidance asymmetry, bench trust depth, and replacement-level gap for any injured/suspended piece. Public injury reporting is noisy in college basketball, so reliability is medium-low until the final 24 hours before tip. Because hidden injuries produce model error spikes, the framework treats late verified status updates as high-priority override inputs.

Contextual conditions include travel distance and time zone shift, altitude exposure (especially for teams unaccustomed to elevation), days of rest, game time local body-clock effects, and venue crowd asymmetry. These effects are generally modest in isolation but gain power as interaction terms with roster depth and pace. For example, shallow high-tempo teams can decay late in games under compressed rest.

Behavioral proxies include late-game free throw reliability, turnover rate under high-leverage possessions, and coaching timeout/ATO effectiveness where measurable. These are often overnarrated but can retain marginal signal when aggregated over enough possessions. Data that is often noise disguised as signal includes broad “momentum” claims unsupported by possession-level efficiency shifts, media narrative intensity, and unadjusted win streaks. Data that is signal disguised as noise includes neutral-site shot-quality trend changes, bench minute stability, and foul profile compatibility in likely whistle environments.

Dependencies: this taxonomy feeds Sections 2, 4, 6, and 9 directly. Open questions include whether sufficient public play-type data granularity will be available without paid sources and how to normalize transfer-era continuity metrics.

## 2) Historical Pattern Analysis Framework: Distinguishing Repeatable Structure from Storytelling

The core question is which historical tournament patterns are causal or at least stable enough to use prospectively. The approach is to evaluate each narrative as a testable hypothesis on a 20+ year sample with rolling-window checks, not as a folklore rule.

Seed matchup history should be treated as a prior, not a verdict. A 12-over-5 upset rate has descriptive value, but predictive value emerges only when layered with archetype features: underseeded power-conference team with top-30 efficiency profile, elite offensive rebounding underdog versus weak defensive rebounding favorite, veteran guard play, and three-point attempt resilience. Conversely, many 12 seeds lose comfortably because they lack either defensive travel (ability to win without hot shooting) or ball-security floor. Therefore the framework decomposes seed narratives into structural preconditions.

Conference tournament performance must be split into process versus outcomes. True signal may exist when conference-tournament games reveal role/rotation consolidation or restored health. Recency bias dominates when analysts infer too much from single-game shooting variance. The model should incorporate conference-tournament possessions with reduced weight unless they coincide with verified roster-state changes.

“Hot team” narratives require mean-reversion controls. The framework uses expected effective field goal percentage and shot-quality differentials to determine whether a run reflects sustainable shot creation/denial or temporary shotmaking. Regular-season head-to-head outcomes carry limited standalone value due to small samples and changed lineups, but they can contribute as contextual evidence when tactical matchups were clear and roster states are comparable.

Data sources include historical brackets, KenPom/Torvik archives, play-by-play repositories, and betting close-line archives for baseline efficiency. Risks include survivorship bias (studying only famous upsets), era drift (three-point volume changes), and model leakage if post-tournament information contaminates training labels. Dependencies are strongest with Sections 3, 6, and 9.

## 3) Advanced Metrics Hierarchy: Building a Weighted Evidence Stack

The core question is how to rank major rating systems by use-case rather than brand familiarity. The approach is to evaluate each system on calibration and discrimination by game context: early-round mismatch games, coin-flip games, and deep-round elite matchups.

KenPom and Torvik are typically strongest for possession-adjusted team quality and tempo context. BPI can add value where lineup/athlete proxies capture dimensions not fully represented in possession statistics. NET is primarily a committee tool and should be treated as an indirect signal, useful mainly for understanding likely seed mispricing and public perception. Sagarin/Haslam/TeamRankings provide independent model families that are valuable for disagreement detection. EvanMiya can contribute player-level influence and transfer-adjusted context.

Divergence between systems is itself a feature. If one model family is materially higher on an underdog, the research process should diagnose why: transition edge, schedule quirks, lineup uncertainty, or recency weighting differences. Systematic divergence accompanied by matchup-compatible features may signal a high-leverage pick opportunity. Random divergence without structural support is more likely noise.

A composite should be built as a stacked model rather than simple averaging. Base learners can include rating-derived win probabilities, matchup interaction terms, and market-implied probabilities; a meta-learner calibrates final game probabilities while penalizing unstable features. The composite should be retrained annually with strict out-of-sample validation and era-sensitive weighting.

Tournament-specific predictors likely include half-court efficiency under pressure, turnover avoidance, defensive rebounding, free throw stability, and lineup flexibility against contrasting styles. Risks include hidden collinearity among rating systems and overconfidence from ensemble consensus. Dependencies: Sections 1, 4, 6, and 9.

## 4) Matchup-Specific Analysis Framework: From Team Ratings to Opponent-Specific Win Paths

The core question is how to move beyond “Team A is better than Team B” into explicit win-condition analysis. The method is to produce, for every game, a matchup dossier that identifies each team’s primary and secondary pathways to victory and failure.

The first layer quantifies style collision: expected possession count, shot-profile conflicts, turnover pressure asymmetry, offensive rebounding battle, and foul-rate interaction. The second layer maps player archetypes to defensive schemes: primary ball-handler pressure resistance, post mismatch exploitability, switch punishment ability, and off-ball movement versus help discipline. The third layer estimates fragility: what happens if one star accumulates two early fouls or if three-point variance runs cold.

Bench depth matters less on average than in high-foul or high-tempo environments; therefore depth enters as an interaction term, not a universal bonus. “Matchup nightmare” classification should require multiple reinforcing edges that are robust to variance, while “paper tiger” identification should focus on teams whose profile depends on one unstable factor (for example, extreme jump-shot dependence without offensive rebounding fallback).

Data sources include play-by-play splits, lineup on/off metrics, shot charts, foul tendencies by position, and coaching scheme tendencies inferred from game logs. Risks are incomplete player-tracking data and overfitting anecdotal scheme notes. This section depends on Sections 1 and 3 and feeds Sections 6 and 7.

## 5) Human and Psychological Factors: Incorporating Soft Variables without Storytelling Drift

The core question is whether and how to include coaching, experience, pressure, and logistics variables without degrading model rigor. The framework treats these as bounded modifiers applied after base probability estimation.

Coaching track record should be adjusted for seed expectation: over/underperformance relative to implied win probability rather than raw wins. Player experience should be proxied through rotation-level tournament minutes and upperclassman usage concentration, but transfer-era context matters because age and continuity can diverge. Pressure performance is measured through free throw percentage in high-leverage possessions, late-game turnover rates, and execution efficiency in final four minutes of close games.

Travel and fan proximity have plausible but moderate effects. They become more relevant when paired with early tip times, short rest, and hostile-crowd asymmetry. Narrative momentum is generally noise unless operationalized as measurable process improvements (e.g., defensive rebounding rate jump sustained over several games). First Four effects should be modeled as dual possibilities: acclimation benefit versus fatigue cost, with impact likely dependent on roster depth and travel sequence.

Sources include historical tournament game logs, venue geodata, roster databases, and game-situation splits. Risks include small sample inflation and confirmation bias. This section depends on Sections 1 and 2 and informs final calibration in Sections 7 and 9.

## 6) Upset Detection System: Structured Identification without Chaos Overfitting

The core question is how to identify upset candidates systematically while preventing bracket entropy. The approach is a two-stage upset engine: candidate generation and confidence calibration.

Candidate generation flags games where underdog win probability exceeds market/seed expectation by a threshold and where at least two structural upset markers are present. Typical markers include three-point volume plus defensive rebounding competency, turnover-margin edge, veteran guard creation, and opponent dependency on one fragile scoring channel. Candidate rejection criteria remove false positives where underdog path requires unsustainably hot shooting without defensive floor.

Confidence calibration uses historical upset-base rates by seed band and round, then applies Bayesian updating with matchup features. This prevents overcorrection into “too many upsets.” The system should output both game-level probabilities and portfolio-level constraints, such as maximum upset count by region and by round based on historical distributions.

The 1-seed decision rule must be explicit: default to advancing 1 seeds until evidence passes a very high threshold, typically requiring severe injury/availability shock, extreme style vulnerability against an elite-profile opponent, and corroboration from independent model disagreement and market movement. Picking against a 1 seed without multi-source confirmation is usually process failure.

Dependencies include Sections 2, 3, 4, and 9. Risks include double-counting correlated upset signals and social-media-driven bias near lock.

## 7) Round-by-Round Calibration: Dynamic Weighting across Tournament Stages

The core question is how evidence weighting should evolve by round. In the First Four and Round of 64, larger mismatch frequency means base-strength metrics and robust efficiency signals should dominate, with restrained upset exposure. In the Round of 32 and Sweet 16, matchup interaction terms increase in weight because talent gaps narrow and style collisions become decisive. In Elite Eight through title game, coaching adjustments, lineup flexibility, and late-game execution reliability gain additional importance.

The architecture handles cascading uncertainty through scenario trees rather than single-path assumptions. For each prospective game not yet determined, the model computes conditional probabilities against all plausible opponents, then updates once actual opponents are known. This reduces brittleness when early picks miss. Championship-game modeling should include unique stress factors: short prep windows, neutral-site sightline effects, and possible fatigue asymmetry from prior-round game script.

Data dependencies include live bracket state, injury refreshes, and market updates. Risks are overreacting to one prior-round result and discarding long-run priors. This section depends on all prior modeling sections and operationalizes them in time.

## 8) Tool and Data Source Inventory: Operational Capability Map for Plan 2

The core question is what toolchain can reliably deliver the necessary data and analysis cadence. Within Claude Code workflows, useful capabilities include local scripting for ETL and model training, file-based documentation/versioning, and command-line retrieval/processing of structured data from APIs or downloadable tables. Where web access is available, it should be used for final injury verification, bracket structure, odds snapshots, and last-minute status changes. If web retrieval is constrained, Plan 2 should predefine fallback sources and manual entry templates.

Primary external sources should include publicly accessible rating sites (KenPom/Torvik/TeamRankings/BPI/NET where legally and technically accessible), official NCAA bracket and game schedule feeds, sports-reference-style historical logs, and market odds from reputable sportsbooks or aggregators. For play-by-play and shot-profile data, the process should prioritize stable APIs or curated datasets over brittle scraping.

The workflow should be hybrid sequential-parallel. Sequential gates are required at model-freeze checkpoints (pre-Selection Sunday baseline, post-bracket reseeding audit, final lock after injury/odds refresh). Parallel workstreams can run for matchup dossier generation, injury tracking, and simulation batches. Late-availability data handling requires an explicit “T-minus” protocol: final refresh windows at 24 hours, 6 hours, and 60 minutes pre-tip for each slate.

Dependencies: this section operationalizes Sections 1–7 and enables Section 11 timeline execution. Open questions include access limitations to proprietary metrics and API rate limits.

## 9) Model Architecture Considerations: Ensemble Design, Simulation Logic, and Validation

The core question is what modeling structure best balances calibration, interpretability, and robustness. A single unified model is simpler but fragile under regime shifts; therefore this blueprint favors an ensemble with transparent components and a calibration layer.

Recommended architecture includes a base rating model (team strength and schedule-adjusted priors), a matchup interaction model (style and player archetype collisions), and a context model (injury/logistics/human factors). Outputs are combined through a meta-calibration layer trained to minimize Brier score and log loss on historical tournament games, with probability calibration checks by seed band.

Monte Carlo simulation is essential for bracket-level coherence but should not replace deterministic game analysis. The process should generate millions of tournament paths from calibrated game probabilities, then extract both marginal advancement odds and joint path plausibility. Deterministic picks come from maximizing probability of exact bracket correctness under dependency constraints, not from independent gamewise argmax alone.

Handling “most likely winner” versus “correct winner” requires distinguishing single-game accuracy from whole-bracket optimization. In isolated picks, choose the highest-probability winner. In full-bracket construction, strategic slight-underdog picks may be justified when they increase the probability mass of a coherent path versus overcrowded chalk paths, but only when model confidence and upset profile support the deviation.

Backtesting should use rolling-origin historical tournaments (e.g., train through year N-1, test on year N) and compare against benchmarks: pure seed chalk, single-metric models, and market-implied picks. Validation metrics should include per-game calibration, round-level accuracy, upset precision/recall, and full-bracket likelihood under realized outcomes. Risks include data leakage, overfitting rare upset regimes, and uncalibrated uncertainty intervals.

Dependencies: integrates all analytical inputs and feeds Sections 10–12.

## 10) Known Failure Modes and Anti-Patterns: Guardrails against Smart-Sounding Errors

The core question is which recurring mistakes degrade bracket performance despite sophisticated analysis. A primary anti-pattern is narrative-first reasoning that cherry-picks stats post hoc. Another is upset inflation, where analysts correctly identify upset candidates but choose too many, collapsing downstream bracket coherence.

Recency overfitting is common: overweighting last ten games without controlling for opponent quality or shooting luck. Another failure is treating committee seeds as objective truth; seeding errors can be informative opportunities, but only if identified with independent efficiency evidence. Overconfidence in model outputs without calibration auditing is equally dangerous.

Conference realignment and transfer-era volatility can break historical assumptions, especially around conference strength translation and continuity metrics. Process guardrails should include explicit uncertainty ranges, mandatory disagreement review when models diverge sharply, and a pre-lock checklist that blocks picks based solely on qualitative buzz.

Dependencies: this section constrains Sections 2, 6, 7, and 9. Open questions concern how rapidly transfer-era dynamics alter historical priors by 2026.

## 11) Timeline and Phasing: What Happens Now, at Selection Sunday, and at Lock

The core question is how to schedule work so critical analysis is completed when information is actually available. Pre-tournament (months in advance), the program should build the historical database, define feature engineering pipelines, validate model families, and establish upset archetype thresholds. This phase should end with a tested baseline engine and documented assumptions.

Selection Sunday phase begins when bracket structure is known. Tasks include seeding error audit, region path difficulty mapping, first-pass game probabilities, and conditional scenario trees for downstream rounds. This phase should produce provisional picks and a ranked list of games most sensitive to late data.

Finalization phase occurs in the final 48 hours and then day-of slates. Inputs include confirmed injuries/availability, late line movement, and any travel/logistics disruptions. The process applies constrained updates, re-runs simulations, and freezes picks at predefined decision gates to avoid emotional last-minute churn.

Dependencies: relies on Section 8 tooling and Section 9 model pipeline. Risks include compressed timelines, data outages, and undocumented manual overrides.

## 12) Success Metrics and Calibration: Measuring Process Quality before and after Results

The core question is how to evaluate whether the methodology is improving even when perfection is not achieved. Pre-tournament success should be defined by model diagnostics: calibration curves, Brier/log-loss versus baselines, stability across validation windows, and transparent confidence intervals by game tier.

During tournament execution, each pick should carry a confidence label tied to probability bands and upset classification rationale. The objective is not performative certainty but calibrated conviction. Post-tournament, the retrospective should separate bad process from bad variance by examining whether losses were driven by unforeseeable shooting tails, hidden injuries, or model misspecification.

Year-over-year learning requires maintaining an error taxonomy: misweighted recency, matchup feature blind spots, injury-information lag, and over/under-upset allocation. These findings become priors for the next cycle and should be versioned as explicit methodology updates.

Dependencies: evaluates outputs from every section, especially Sections 9–11.

## Plan 2 Execution Roadmap

Plan 2 should execute in six phases with hard inputs, outputs, and decision gates. Phase 1 is infrastructure and data acquisition, where the team finalizes source access, builds ETL pipelines, and validates data integrity; output is a reproducible data warehouse and feature dictionary. Phase 2 is historical modeling and benchmark establishment, where baseline and ensemble models are trained on prior tournaments with rolling backtests; output is a calibrated model stack and benchmark report.

Phase 3 is pre-Selection Sunday readiness, where upset archetype rules, round-specific weighting templates, and matchup dossier generators are finalized; output is a locked methodology handbook and automation scripts. Phase 4 is Selection Sunday ingestion and provisional forecasting, where bracket structure is ingested, game probabilities are generated, and first-pass bracket paths are simulated; output is a provisional bracket set plus sensitivity report.

Phase 5 is final update and pick lock, where injury/availability/market refreshes are applied under controlled update rules, simulations are rerun, and one final bracket is selected with audit trails for every non-chalk deviation; output is the official submission bracket and confidence ledger. Phase 6 is post-mortem and model revision, where predictions are scored, error taxonomy is updated, and methodological changes are prioritized for the 2027 cycle; output is a retrospective document and next-year backlog.

The roadmap’s governing principle is disciplined adaptability: update aggressively when high-quality new information arrives, but never abandon calibrated priors for narrative noise. This is the best available architecture for maximizing correctness probability in a domain where variance cannot be eliminated.
