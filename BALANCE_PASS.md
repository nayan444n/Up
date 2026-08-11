# Balance Pass

## Goals
- Smooth difficulty growth across 100 campaign levels.
- Prevent exponential boss scaling.
- Keep coin inflation below upgrade-cost inflation.
- Make later levels harder without requiring a single specific ship.

## Engineering rules
- Level scaling is centralized in `src/utils/balance.ts`.
- Economy caps are validated by `validatePlayerStats()`.
- Upgrade costs use bounded progression.
- Endless mode is isolated from campaign unlock state.
- Prestige is capped and cannot create negative currency.

## Manual QA targets
- Level 1 should feel forgiving.
- Levels 10–30 should introduce pressure without requiring premium ships.
- Levels 50–75 should reward upgrades and skill.
- Level 100 should be a meaningful final-boss challenge.
