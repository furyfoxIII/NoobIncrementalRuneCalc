/*
 * variance.js — distribution info (variance, percentiles) for the
 * Prediction engine, replacing what Monte Carlo used to show. Still
 * closed-form, no looping, works at any scale.
 *
 * --- Variance of ONE success, accounting for pity ------------------------
 * T (individual rune-opens until one success, pity-capped at M) has
 *     P(T = k) = (1-p)^(k-1) * p       for k = 1..M-1
 *     P(T = M) = (1-p)^(M-1)           (guaranteed by pity)
 *
 * Using the standard tail-sum identity for a non-negative integer random
 * variable, E[T] = SUM_{k=0}^{M-1} P(T>k) = SUM_{k=0}^{M-1} q^k (this is
 * the same series prediction.js already sums in closed form), and
 * E[T^2] = SUM_{k=0}^{M-1} (2k+1) q^k = 2*S1 + E[T], where
 *     S1 = SUM_{k=0}^{M-1} k q^k = q*(1 - M*q^(M-1) + (M-1)*q^M) / p^2
 * (finite arithmetico-geometric series). Var[T] = E[T^2] - E[T]^2.
 *
 * Sanity check: as M -> infinity (pity never realistically triggers),
 * q^M, q^(M-1) -> 0 and this reduces to the standard geometric-distribution
 * variance (1-p)/p^2 — confirms the derivation.
 *
 * --- X successes -----------------------------------------------------------
 * Pity resets each cycle, so the `successesNeeded` cycles are i.i.d. and
 * variances add: Var[T_total] = successesNeeded * Var[T]. Clones are
 * guaranteed, so `successesNeeded` is ceil(copies / 2), a whole number
 * (see clones.js): the number of successes is exact, not an average, which
 * means no extra variance from it.
 *
 * --- Percentiles -------------------------------------------------------
 * With `copies` i.i.d. cycles summed together, you might reach for the
 * Central Limit Theorem and a Normal approximation for the total. In
 * practice that fails badly here: a single pity-capped trial is skewed
 * and near-geometric with stdDev comparable to its own mean, and `copies`
 * is usually far too small a sample for CLT to have kicked in, so the
 * Normal fit routinely swings negative at low percentiles. Instead the
 * total is moment-matched to a Gamma distribution (right-skewed,
 * non-negative by construction) and its quantile approximated via the
 * Wilson-Hilferty cube-root transform — this is what gives you "P90 time
 * to get X" without ever simulating a single roll, and without the
 * Normal approximation's tendency to collapse low percentiles down to a
 * meaningless, copies-independent floor. The result is still clamped to
 * [copies, copies * pityThreshold], the hard bounds pity itself
 * guarantees, as a sanity backstop rather than the primary estimate.
 */
(function () {
    window.RS = window.RS || {};

    var Variance = {};

    // Mean / variance / stdDev of T = individual rune-opens for ONE
    // success on `drop`.
    //
    // (All values here are BigNumbers — see lib/bignumber.min.js — so the
    // astronomically large/small drop odds can't overflow/underflow a double.)
    //
    // Numerical note: the textbook finite arithmetico-geometric sum
    //     S1 = q(1 - M*q^(M-1) + (M-1)*q^M) / p^2
    // is fine on paper, but this game's drop denominators run up to ~1e67,
    // so M ~ 2e67 and M*q^(M-1) / (M-1)*q^M become two ~1e66-magnitude
    // terms that nearly cancel to leave a residual ~66 orders of magnitude
    // smaller — total loss of precision in a double. Rewriting the bracket
    // algebraically (using M*p + q in place of the raw M*q^(M-1) vs.
    // (M-1)*q^M subtraction) sidesteps that cancellation entirely:
    //     1 - M*q^(M-1) + (M-1)*q^M  ===  1 - q^(M-1) * (M*p + q)
    // (expand the right side: q^(M-1)*(M*p+q) = M*p*q^(M-1) + q^M, and
    // M*p*q^(M-1) = M*q^(M-1) - M*q^M = M*q^(M-1) - (M-1)*q^M - q^M, which
    // rearranges back to the original bracket). M*p is a well-conditioned
    // product (a huge number times a tiny one, not a subtraction of two
    // huge ones), so this form stays accurate at any scale.
    Variance.singleTrialStats = function (drop, luckValue, openingRune) {
        // Clamp to 1 (a chance can't exceed certainty), matching
        // Prediction.expectedTrialsPerSuccess; with huge Luck an uncapped
        // drop's raw chance could otherwise come out above 1.
        var p = BigNumber.min(1, RS.Luck.normalizedChance(drop, luckValue, openingRune));
        var M = RS.Pity.threshold(drop, luckValue, openingRune);
        var one = new BigNumber(1);
        var q = one.minus(p);

        // No-pity drops (M is Infinity, see pity.js) reduce to the plain
        // geometric distribution. The M -> Infinity limit works for `mean`
        // via exp(-Infinity) = 0 below, but the cancellation-free bracket
        // used for variance hits qM1 * (M*p + q) = 0 * Infinity = NaN, so
        // it's handled directly here instead of falling through.
        if (!M.isFinite()) {
            var meanNoPity = one.div(p);
            var varianceNoPity = q.div(p.times(p));
            return { mean: meanNoPity, variance: varianceNoPity, stdDev: varianceNoPity.sqrt() };
        }

        var logQ = RS.Numbers.log1pNegative(p);

        // (1-p)^M and (1-p)^(M-1) are probabilities in [0, 1], so they fit a
        // plain double even when M and p are astronomically large/small.
        var qM = Math.exp(M.times(logQ).toNumber());
        var qM1 = Math.exp(M.minus(1).times(logQ).toNumber());

        var mean = new BigNumber(1 - qM).div(p);

        var bracket = one.minus(M.times(p).plus(q).times(qM1)); // cancellation-free form, see note above
        var s1 = q.times(bracket).div(p.times(p));

        var meanSquare = s1.times(2).plus(mean);
        var variance = BigNumber.max(0, meanSquare.minus(mean.times(mean)));

        return { mean: mean, variance: variance, stdDev: variance.sqrt() };
    };

    // Mean / variance / stdDev of the TOTAL individual rune-opens needed
    // for `copies` copies (ceil(copies / 2) successes, see clones.js).
    // All BigNumbers.
    Variance.totalTrialsStats = function (drop, luckValue, copies, openingRune) {
        var single = Variance.singleTrialStats(drop, luckValue, openingRune);
        var successesNeeded = RS.Clones.successesNeeded(copies, openingRune);
        var variance = successesNeeded.times(single.variance);

        return {
            mean: successesNeeded.times(single.mean),
            variance: variance,
            stdDev: variance.sqrt()
        };
    };

    // Inverse standard normal CDF (probit), via Acklam's rational
    // approximation (relative error <= 1.15e-9 across (0,1) — plenty for
    // percentile display). Returns the z-score for cumulative probability p.
    Variance.probit = function (p) {
        if (!(p > 0) || !(p < 1)) {
            if (p <= 0) return -Infinity;
            if (p >= 1) return Infinity;
            return NaN;
        }

        var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
            1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
            6.680131188771972e+01, -1.328068155288572e+01];
        var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
            -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
            3.754408661907416e+00];

        var pLow = 0.02425, pHigh = 1 - pLow, q, r;

        if (p < pLow) {
            q = Math.sqrt(-2 * Math.log(p));
            return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
        if (p <= pHigh) {
            q = p - 0.5;
            r = q * q;
            return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
                (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
        }
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    };

    // Moment-matched Gamma quantile via the Wilson-Hilferty cube-root
    // Normal approximation. `mean`/`variance` are matched to a Gamma(k,
    // theta) with k = mean^2/variance, theta = variance/mean, then that
    // Gamma's p-th quantile is approximated as
    //     k*theta * (1 - 1/(9k) + z_p*sqrt(1/(9k)))^3
    //
    // Why not the plain Normal approximation this replaced: T (individual
    // rune-opens for one success, pity-capped) is a skewed, near-geometric
    // variable where stdDev is comparable in size to the mean itself, not
    // a small correction to it. Summing a handful of i.i.d. copies of that
    // (few `copies` requested) doesn't get you far into CLT territory --
    // the sum stays right-skewed and bounded at 0, not remotely Gaussian.
    // A Normal fit routinely swings deep negative at low percentiles for
    // exactly this shape, which is what made P1 (1% lucky) collapse to a
    // clamped, copies-independent floor instead of a real quantile: e.g.
    // requesting 3 vs. 4 copies of a heavily-pitied drop produced the
    // *identical* P1 trial count (both clamped to their tiny, unrelated
    // floors), because the underlying Gaussian estimate was garbage in
    // both cases. The Gamma fit is right-skewed and non-negative by
    // construction, so it tracks the true shape of this distribution far
    // better, and its quantiles scale meaningfully with `copies` instead
    // of bottoming out at a fixed floor.
    Variance.gammaQuantile = function (mean, variance, p) {
        mean = BigNumber.from(mean);
        variance = BigNumber.from(variance);
        if (!variance.gt(0)) return mean;
        var z = Variance.probit(p);
        var k = mean.times(mean).div(variance).toNumber();   // shape (Infinity if astronomically large)
        // k * theta = mean, so the quantile is mean * term^3.
        var h = k === Infinity ? 0 : 1 / (9 * k);
        if (!isFinite(h)) return new BigNumber(0);
        var term = 1 - h + z * Math.sqrt(h);
        if (term < 0) return new BigNumber(0);                // beyond this Gamma fit's left tail
        return mean.times(term * term * term);
    };

    // EXACT `u`-th quantile (0 < u < 1) of T, the individual rune-opens to
    // get ONE success on `drop` (pity-capped geometric):
    //     P(T <= k) = 1 - (1-p)^k   for k < M,   and   P(T <= M) = 1
    // so the smallest k with P(T <= k) >= u is
    //     k = min(M, ceil( ln(1-u) / ln(1-p) )).
    // ln(1-p) goes through RS.Numbers.log1pNegative so it stays accurate
    // for astronomically small p. No approximation is involved; this is
    // used instead of the Gamma fit whenever exactly one success is needed
    // (the fit is weakest there, with shape parameter ~1).
    Variance.singleCopyQuantile = function (drop, luckValue, u, openingRune) {
        var p = BigNumber.min(1, RS.Luck.normalizedChance(drop, luckValue, openingRune));
        if (!p.gt(0)) return new BigNumber(Infinity);
        if (p.gte(1)) return new BigNumber(1);

        var M = RS.Pity.threshold(drop, luckValue, openingRune);
        // The ratio can land a hair above an integer from float noise when
        // u coincides with a CDF step (e.g. u == p), so shave a relative
        // 1e-12 before taking the ceiling.
        var ratio = new BigNumber(Math.log(1 - u)).div(RS.Numbers.log1pNegative(p));
        var k = BigNumber.max(1, ratio.times(1 - 1e-12).ceil());
        return M.isFinite() ? BigNumber.min(k, M) : k;
    };

    // --- Exact quantiles for a small number of copies -------------------------
    //
    // The Gamma fit below is accurate for many copies but, checked against
    // Monte Carlo, is badly off for a FEW copies of a pity-capped drop
    // (e.g. P1 for 2 copies was ~80% too slow). For the odds this game
    // actually has (rare drops, p <= EXACT_MAX_CHANCE) there is an exact
    // answer, using the continuous limit of the geometric distribution:
    //
    //   Work in units of 1/p opens: one success takes E ~ Exp(1) (that is
    //   the p -> 0 limit of a geometric), and pity caps it at m =
    //   PITY_MULTIPLIER (the threshold is m / p opens). The sum S of X
    //   independent cycles Y = min(E, m) then has a distribution that does
    //   not depend on p at all, and a closed form:
    //
    //   * No pity: S ~ Erlang(X), CDF  F_X(x) = 1 - e^-x * SUM_{i<X} x^i/i!
    //   * Pity: condition on j cycles being capped (each contributes exactly
    //     m, with probability c = e^-m) and use inclusion-exclusion for the
    //     other n = X-j cycles all being < m (memorylessness gives each
    //     "E >= m" term as e^-m times a shifted Erlang CDF):
    //         P(S <= x) = SUM_j SUM_m (-1)^m C(X,j) C(X-j,m) c^(j+m)
    //                              * F_{X-j}(x - m*(j+m))
    //     (F_0(y) = 1 for y >= 0). The alternating sum's terms are bounded
    //     by (1+2c)^X, so it loses ~0.1 digits per success -- fine up to
    //     EXACT_MAX_SUCCESSES_PITY successes, which is why larger counts fall
    //     back to the Gamma fit (whose error was measured at ~1% there against
    //     Monte Carlo simulation).
    //
    // The quantile is found by bisection on that CDF and converted back to
    // opens by dividing by p. Discreteness of the real geometric is ignored;
    // at p <= EXACT_MAX_CHANCE that was measured as a <~1% effect against
    // Monte Carlo simulation.
    var EXACT_MAX_CHANCE = 0.01;
    var EXACT_MAX_SUCCESSES_PITY = 40;
    var EXACT_MAX_SUCCESSES_NO_PITY = 100;

    // Erlang(n) CDF at y: P(sum of n Exp(1) <= y). Uses the upper series
    // when y < n (no catastrophic 1 - almost-1 cancellation in the lower
    // tail) and the complement otherwise.
    function erlangCdf(n, y) {
        if (n === 0) return y >= 0 ? 1 : 0;
        if (!(y > 0)) return 0;
        var t = Math.exp(-y);
        if (y < n) {
            for (var i = 1; i <= n; i++) t *= y / i;      // e^-y y^n / n!
            var sum = t;
            for (var k = n + 1; t > 1e-18 * sum && k < n + 2000; k++) {
                t *= y / k;
                sum += t;
            }
            return Math.min(1, sum);
        }
        var cum = t, term = t;                            // SUM_{i<n} e^-y y^i/i!
        for (var j = 1; j < n; j++) {
            term *= y / j;
            cum += term;
        }
        return Math.max(0, 1 - cum);
    }

    function binom(n, k) {
        var r = 1;
        for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
        return r;
    }

    // P(S <= x) for the sum of X cycles, `cap` = pity multiplier (or null
    // for no pity), in units of 1/p opens.
    function sumCdf(X, cap, x) {
        if (cap === null) return erlangCdf(X, x);
        var c = Math.exp(-cap);
        var total = 0;
        for (var j = 0; j <= X && cap * j <= x; j++) {
            var n = X - j;
            var inner = 0;
            for (var m = 0; m <= n && cap * (j + m) <= x; m++) {
                var term = binom(n, m) * Math.pow(c, m) * erlangCdf(n, x - cap * (j + m));
                inner += (m % 2 === 0) ? term : -term;
            }
            total += binom(X, j) * Math.pow(c, j) * inner;
        }
        return Math.min(1, Math.max(0, total));
    }

    function sumQuantile(X, cap, u) {
        var lo = 0;
        var hi = cap === null ? X + 20 * Math.sqrt(X) + 60 : cap * X;
        if (cap === null) {
            while (sumCdf(X, cap, hi) < u) hi *= 2;
        }
        for (var it = 0; it < 100; it++) {
            var mid = (lo + hi) / 2;
            if (sumCdf(X, cap, mid) >= u) hi = mid; else lo = mid;
        }
        return hi;
    }

    // Returns the exact quantile (BigNumber of opens) when this case is
    // covered (2+ integer copies, rare odds), or null to fall back.
    function exactSmallCountQuantile(drop, luckValue, copies, u, openingRune) {
        var X = BigNumber.from(copies).toNumber();
        if (!(X >= 2) || Math.floor(X) !== X) return null;

        var chance = BigNumber.min(1, RS.Luck.normalizedChance(drop, luckValue, openingRune));
        if (!chance.gt(0) || chance.gt(EXACT_MAX_CHANCE)) return null;

        var hasPity = RS.Pity.threshold(drop, luckValue, openingRune).isFinite();
        if (X > (hasPity ? EXACT_MAX_SUCCESSES_PITY : EXACT_MAX_SUCCESSES_NO_PITY)) return null;

        var cap = hasPity ? RS.Config.PITY_MULTIPLIER : null;
        return new BigNumber(sumQuantile(X, cap, u)).div(chance);
    }

    // The `p`-th percentile (0 < p < 1) of the total-trials distribution
    // for `copies` copies, i.e. S = ceil(copies / 2) successes (clones are
    // guaranteed, see clones.js):
    //   * exactly 1 success         -> exact discrete quantile (above)
    //   * a few successes, rare odds -> exact continuous-limit quantile
    //   * many successes / common odds -> the Gamma approximation described
    //     above
    // All three were checked against Monte Carlo simulation.
    Variance.totalTrialsPercentile = function (drop, luckValue, copies, p, openingRune) {
        var successes = RS.Clones.successesNeeded(copies, openingRune);
        if (successes.eq(1)) {
            return Variance.singleCopyQuantile(drop, luckValue, p, openingRune);
        }
        var exact = exactSmallCountQuantile(drop, luckValue, successes, p, openingRune);
        if (exact) {
            var floorBound = successes;
            var ceilBound = floorBound.times(RS.Pity.threshold(drop, luckValue, openingRune));
            return BigNumber.max(floorBound, BigNumber.min(exact, ceilBound));
        }
        var stats = Variance.totalTrialsStats(drop, luckValue, copies, openingRune);
        var value = Variance.gammaQuantile(stats.mean, stats.variance, p);

        // Hard sanity bounds, not the primary source of the estimate
        // anymore: you can never get a success in zero opens (one
        // rune-open per success is the true floor), and pity guarantees
        // every success lands within M rune-opens (`successes * M` is the
        // true ceiling). The Gamma quantile above should land well inside
        // this range in ordinary cases; these just protect against
        // approximation error at extreme percentiles.
        var lowerBound = successes;
        var M = RS.Pity.threshold(drop, luckValue, openingRune);
        var upperBound = lowerBound.times(M);
        return BigNumber.max(lowerBound, BigNumber.min(value, upperBound));
    };

    RS.Variance = Variance;
})();
