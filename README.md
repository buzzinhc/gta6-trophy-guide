# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/buzzinhc/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/buzzinhc/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — a complete trophy guide and progress tracker for Grand Theft Auto VI on PlayStation 5, built as a plain static web app. No build step, no accounts, no network: serve the folder and open it.

## What's inside

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden until earned — each with the official name and description plus an original 2–4 sentence guide: what to do, where and how, whether it can be missed, and when in the game to do it.
- **A six-stage platinum roadmap**: story campaign → strangers & side strands → activities & challenges → collectibles & exploration → crime, money & free-roam feats → 100% and the platinum. Every trophy sits in exactly one stage.
- **Missables, flagged loudly.** PowerPyx and GTABase flag *Positive Mental Attitude* as possibly missable, and TechWiser reports the five stranger chains run on story-progress windows; those six carry a red CAN BE MISSED flag, and ten one-off moment trophies (an unscheduled airport departure, a cocktail on Ocean Beach, a second-try success…) are marked ONE-OFF so you grab them as they pass.
- **A working tracker**: tick trophies off (saved in your browser), watch overall and per-grade progress bars fill, filter by type (story / missable / collectibles / activities / online) and grade, search by name or keyword, and export your progress as JSON to move it between devices — import restores it.
- **A spoiler shield**: flip it on and every unearned hidden trophy is masked — name, description and guide — so you can track a blind playthrough without spoiling the story. (There are no online trophies to track, by the way: all 55 are offline and single-player.)
- **A detail view for every trophy** with the full guide text and its source, in big readable type.

## Data & sources

Trophy names, descriptions, grades and hidden flags are the official PS5 list as published on 2026-11-18, via Exophase and PSNProfiles and cross-checked against the same list as republished by PowerPyx, GTABase, Beebom and TechWiser. The guide text, type classification, roadmap order and missable flags are original to this guide; where a specific claim comes from somewhere else (the missable reporting above, the 500-choice counter, activity counts), the trophy's own source line in the app names it. Where the official description is all anyone has — a tank, a strange event, a partnership moment — the guide says what can honestly be concluded and labels the rest unconfirmed instead of inventing steps.

One practical warning the guide repeats in-app: GTABase and TechWiser report that using cheats disables trophies and saving. Keep cheats off for a trophy run.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 in a desktop browser. The app is fully static (`app/`), works offline once loaded, and stores progress only in your own browser's local storage. Views deep-link through the URL: `?view=roadmap` opens the roadmap, `?kind=missable` filters to the missable and one-off trophies, and `?detail=17` opens one trophy's guide directly.

<sub>Entered on [make.fun](https://make.fun/?ref=fjpy230d&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
