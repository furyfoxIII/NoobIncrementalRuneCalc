# Rune Simulator

Made by furyfoxIII.

A client-side calculator for a rune-opening incremental game. Tell it your
Bulk, Speed and Luck and it predicts how long it will take (and how much it
will cost) to get X copies of a rune, what a pile of currency is expected to
buy, and how long your Prism income lasts. Everything runs in the browser;
there is no server and no build step.

## Running it

Open `index.html` in a browser. Nothing is fetched at runtime, so
double-clicking the file works. To serve it instead, any static server does:

```
python3 -m http.server 8000     # then visit http://localhost:8000
```

Your settings (Bulk/Speed/Luck for each track, the Prism settings,
the active tab) are saved in the browser's `localStorage`, so
you don't retype them. If storage is unavailable the app still works; it just
won't remember anything.

## Using it

### Rune section

Sidebar. Pick a Realm and an Opening Rune, then enter your stats:

| Field | Meaning |
| --- | --- |
| Bulk | Runes opened per opening action |
| Speed | Seconds per opening action (smallest accepted value: 0.001) |
| Luck | Divides the odds of luck-affected drops, down to each drop's cap |

Runes opened per second is `Bulk / Speed`. Normal runes, each event track
(Football, Halloween, Thanksgiving, ...) and the Prism runes each have their own Bulk /
Speed / Luck, mirroring the game; the labels rename themselves to show which
track you are editing. Values are never lost when you switch between them.

Shared roll. When Luck pushes drops towards their caps and a table's chances
add up to more than 100%, the odds are scaled back to fit (this is the effect
the game's developers describe: high Luck means fewer Noobinials); see
[Odds model](#1-odds-model-and-the-shared-roll). Whenever that is lowering a
drop's odds, the drop table shows the scaled `1/X` with the raw `1/X` beside it.

Opening tab:

- Prediction: choose a target rune and how many copies you want. The Rune
  Info panel shows the odds used (and the raw odds when the shared roll is
  lowering them), expected opens (total opens needed for the copies you asked for; each drop also brings a clone, except on event runes, which have no clones),
  estimated time and cost, a lucky / median / unlucky bracket (P1, P50, P99),
  and what else you'd expect to collect along the way. Clones are guaranteed, so
  each success gives 2 copies: 5 copies are 3 successes, and you end up with 6.
- Drop Table & Effective Odds: every drop with its current odds and the
  average time to get one copy. The odds and the time come from the same
  model, so they always agree. (For pity drops the time is slightly shorter
  than `1/odds / rate`, because the pity guarantee shortens the average; hover
  the time pill for details.)

Economy tab: enter an amount of currency to see how many individual runes
it buys, how long that takes, and the expected copies of every drop.

### Prism section

- Prism Settings: Prism gained per cycle, cycle length, capsule bulk (max 20),
  Prism cost per capsule, and the Minion Master gamepass (0.9 s per batch
  instead of 1 s).
- Prism Over Time: timeframe -> Prism earned, or target Prism -> time needed.
  Timeframes accept things like `2h50min`, `3d 10h`, `1day 1hour`.
- Capsule Opening Time: given a stockpile, how long (and how many capsules)
  until you run out, or "never" if income covers the cost.

### Number formats

Inputs accept plain numbers, commas, scientific notation (`1.5e45`, `e9999`)
and game suffixes: `K, M, B, T, Qd, Qn, Sx, Sp, Oc, No, De, UDe, ...` (short
scale, up to `Sg`; `qg`/`Qg` and `sg`/`Sg` are case-sensitive). Numbers are
stored as mantissa + exponent, so values far beyond the ~1e308 limit of a
normal JavaScript number work. Output is switched to `eXXX` notation from 1e100
(the odds display keeps the named suffixes further). Formatting truncates
rather than rounds, so `114.99` with 3 digits shows as `114`.

## How the numbers are computed

All maths is closed-form (no brute-force simulation), which is what lets it
answer "100 copies of a 1-in-1e60 rune" instantly. The code lives in
`js/engine/` and is pure: it takes numbers in and returns numbers out.

### 1. Odds model and the shared roll

Each drop has a base odds denominator (`1/baseChance`) and a type.

- Basic drops: effective denominator = `baseChance / Luck`, but never lower
  than the drop's `cap`. A drop with no cap (the `cap` property missing, `null`,
  or an empty string) has no floor yet (the game hasn't published one), so Luck
  keeps dividing.
- Noobinial drops ignore Luck and have no cap.

That gives each drop's raw chance. But every open is a single roll shared
by the whole drop table, and Luck pushes Basic drops towards their caps (often
1/10). Once enough of them are that likely, the table's raw chances add up to
more than 100%, and the fixed-odds Noobinials lose out. The game's developers
describe this: in Realm 3 and below, a rune Luck of 1 gives about 1.5x more
Noobinials, because runes get pushed down to 1/10 odds and hurt Noobinial
chances; runes without that are not affected, and Realm 4 and above no longer
have the effect.

It is modeled by scaling the table back down to 100% when, and only when, its
raw chances exceed it:

```
chance = raw chance / max(1, sum of the raw chances of the pooled drops)
```

A table that adds up to 1 or less keeps its published odds exactly. Uncapped
Basic drops are left out of the pool, because their chance has no ceiling and
would otherwise end up dividing by themselves. This reproduces the
developers' note: on Basic, Luck 1 gives 1.52x the Noobinials of very high
Luck (1.51x on Super), while runes without 1/10-style drops, and Realm 4 and
above, are unchanged.

The developers state the effect's size and where it applies, not the exact
formula, so the formula itself is a model that fits their description.

### 2. Pity

Only Noobinial drops have pity. After `PITY_MULTIPLIER x` (default 2) their
effective denominator in consecutive misses, the next open is guaranteed. The
counter resets after each success. If `p` is the per-open chance and `M` the
pity threshold, opens needed for one copy are a capped geometric variable with

```
E[T] = (1 - (1-p)^M) / p        (about 0.865 / p for rare drops, since M p = 2)
```

computed with `exp(M * log1p(-p))` so it stays stable when `p` is 1e-60.

### 3. Copies, clones, time and cost

- Clones are guaranteed: every success also drops a clone, so each success
  gives 2 copies (`COPIES_PER_SUCCESS` in `js/config.js`). The exception is
  the Events realm: event runes have no clone mechanic (`clones: false` in
  `js/data/runes.js`), so each success gives 1 copy and X copies need X successes. X copies therefore
  need `ceil(X / 2)` successes, always a whole number: 1 copy needs 1 success
  (you end up with 2), 5 copies need 3 (you end up with 6).
- `runes/second = Bulk / Speed`; time = opens / (runes/second).
- Cost = opens x cost per rune. It is not rounded up to whole bulk batches:
  currency buys individual opens, and Bulk only sets throughput.

### 4. Variance and percentiles (P1 / P50 / P99)

The totals for X copies are the sum of S = `ceil(X / 2)` (S = X on event runes,
which have no clones) independent
capped-geometric cycles, one per success.
Percentiles use the most exact method that applies:

| Situation | Method |
| --- | --- |
| Exactly 1 success (1 or 2 copies) | Exact quantile: `min(M, ceil(ln(1-u) / ln(1-p)))` |
| 2+ successes, rare odds (chance <= 1%), up to 40 successes (pity) / 100 (no pity) | Exact in the continuous limit: Erlang for no pity; for pity, inclusion-exclusion over how many cycles hit the cap (see `js/engine/variance.js`) |
| Everything else (many successes, or common odds) | Moment-matched Gamma with the Wilson-Hilferty quantile |

Percentiles are clamped to `[S, S x M]`, the hard bounds pity guarantees.
Because clones are guaranteed, the number of successes is exact, so it adds no
variance of its own.

Checked against Monte Carlo (200,000 simulated runs per case, when this was
written): at 1-in-1000 odds the exact path is within
about 1% of simulation for 2-100 successes, and the Gamma fallback (60-120 pity
successes) is within about 1.5%. For quite common odds (1-in-100) the continuous
limit shows rounding of a trial or two on very small totals. Before the exact
path existed, the Gamma fit alone was off by up to ~90% at P1 for 2 successes of a
pity drop.

### 5. Economy

Opens bought = `floor(currency / cost per rune)`. Expected copies of a drop =
`opens / E[T] x COPIES_PER_SUCCESS`. This is an average, so it can be
fractional, while the Prediction tab rounds up to whole successes.

### 6. Prism

Income/second = `perCycle / cycleSeconds`. Capsules/second = `bulk / interval`
(interval 1 s, or 0.9 s with Minion Master; bulk clamped to 1-20). If spending
exceeds income, the stockpile lasts `stockpile / (spend - income)`, rounded up
to a whole interval, since opening happens in whole batches.

## Assumptions and limitations

- The shared-roll formula (above) fits the developers' description of the
  effect but is not something they have spelled out. The developers also say
  Realm 4 and above no longer have the effect, while the data's Underwater rune
  still has a cap of 10 on `Bubbles`, which the model would start to scale at
  Luck around 1e9 and up (~12% at extreme Luck). Worth checking that cap.
- `COPIES_PER_SUCCESS` (clones are assumed guaranteed on every drop of every
  non-event rune), `PITY_MULTIPLIER` and every number in `js/data/runes.js` are
  taken as given. The calculator is only as accurate as that data.
- Drops with no cap (missing, `null` or an empty string) are treated as
  uncapped (luck never stops helping).
- Predictions are statistical: "expected" and the percentiles describe many
  hypothetical runs, not what your next run will do.
- Speed below 0.001 s is clamped to 0.001 s (one constant,
  `MIN_SPEED_SECONDS`, used by both the input and the engine).

## Updating the data

All game data is in `js/data/runes.js`: realms, opening runes and their drops,
ordered common -> rare.

```js
{
    name: "Basic",
    cost: { currency: "Fire", amount: "41.4" },
    drops: [
        { name: "Rookie",  baseChance: "1.25", type: "Basic",     cap: "1.25" },
        { name: "Example", baseChance: "5Sx",  type: "Noobinial" }
    ]
}
```

`baseChance` and `cap` are odds denominators in the game-number format; `cap`
may be left out, `null` or `""` for "no floor known". A rune in the realm named `Events` gets its
own Bulk/Speed/Luck track automatically (named after the rune, or after an
optional `track:` field; runes that share a `track:` share the stats). Colors for rune names live in `js/data/runeColors.js`.

If the game changes base chances or adds runes, send the new values to
`furyfoxiii` on Discord.

## Project layout

```
index.html            page structure
css/                  theme tokens + styles
fonts/                bundled web fonts
lib/bignumber.min.js  small mantissa/exponent big-number class
js/config.js          constants (pity multiplier, copies per success, defaults, ...)
js/data/              rune database and name colors
js/engine/            pure maths: luck, pity, clones, variance, prediction, economy, prism, time, numbers
js/state/appState.js  single source of truth + localStorage persistence
js/ui/                one module per panel
```

## License

MIT; see [LICENSE](LICENSE). Copyright (c) 2026 furyfoxIII.

`lib/bignumber.min.js` is a small in-house implementation and is covered by the
same license. The bundled fonts (Inter, JetBrains Mono, Space Grotesk) are
distributed under the SIL Open Font License 1.1 and keep their own licenses.
