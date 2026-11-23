(async function () {
'use strict';
const D = await (await fetch('data.json')).json();
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const C = { dt: css('--dt'), rf: css('--rf'), xgb: css('--xgb') };
const NAME = { dt: 'Decision Tree', rf: 'Random Forest', xgb: 'XGBoost' };
const MODELS = ['dt', 'rf', 'xgb'];
const SPL = ['train', 'val', 'test'], SPLN = { train: 'Training', val: 'Validation', test: 'Test' };
const MET = [
  { k: 'RMSE', i: 0, f: v => money(v), lower: true, long: 'Root mean squared error ($)' },
  { k: 'MAE', i: 1, f: v => money(v), lower: true, long: 'Mean absolute error ($)' },
  { k: 'R²', i: 2, f: v => v.toFixed(3), lower: false, long: 'R² (share of price variation explained)' },
  { k: 'MAPE', i: 3, f: v => v.toFixed(1) + '%', lower: true, long: 'Mean absolute % error' }];
const money = v => '$' + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v));
const usd = v => '$' + Math.round(v).toLocaleString();
const pf = v => Number.isInteger(v) ? v.toFixed(1) : String(v); // python float repr
const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
Chart.defaults.font.size = 12;
Chart.defaults.color = css('--text-2');
Chart.defaults.borderColor = css('--grid');
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.boxHeight = 10;
Chart.defaults.plugins.legend.labels.useBorderRadius = true;
Chart.defaults.plugins.legend.labels.borderRadius = 3;
Chart.defaults.plugins.legend.align = 'start';
Chart.defaults.plugins.tooltip.backgroundColor = css('--text');
Chart.defaults.plugins.tooltip.titleColor = css('--surface');
Chart.defaults.plugins.tooltip.bodyColor = css('--surface');
Chart.defaults.plugins.tooltip.padding = 9;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.animation.duration = 350;
Chart.defaults.elements.bar.borderRadius = 4;
Chart.defaults.elements.line.borderWidth = 2;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hoverRadius = 5;
const charts = {};
function draw(id, cfg) { if (charts[id]) charts[id].destroy(); charts[id] = new Chart(document.getElementById(id), cfg); return charts[id]; }
const $ = s => document.querySelector(s);
function seg(el, opts, cur, cb) {
  el.innerHTML = opts.map(([v, l]) => `<button data-v="${v}" class="${v == cur ? 'on' : ''}">${l}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; [...el.children].forEach(x => x.classList.toggle('on', x === b)); cb(b.dataset.v); };
}
const dollarAxis = { ticks: { callback: v => money(v) } };

const F = D.final_metrics, B = D.best;
const H = D.houses;

// ---------------------------------------------------------------- page skeleton
$('#app').innerHTML = `
<section id="results">
  <div class="step">The answer first</div>
  <h2>Who wins?</h2>
  <p>Each model was tuned on the <b>validation</b> set, then scored once on the untouched <b>test</b> set. Test is the honest number: it estimates how the model will do on houses it has never seen.</p>
  <div class="grid3" id="tiles"></div>
  <div class="card">
    <div class="row"><div><div class="ctitle">Every metric, every data split</div><div class="csub">Pick a metric. Bars are grouped by data split; colour is the model.</div></div><div style="flex:1"></div><div class="seg" id="resMetric"></div></div>
    <div class="chart"><canvas id="resChart"></canvas></div>
  </div>
  <div class="card tablewrap"><div class="ctitle">Full scoreboard (tuned models)</div><div class="csub">Bold = best of the three on that split. RMSE, MAE in dollars; MAPE = average % miss.</div><table id="resTable"></table></div>
  <div class="why" id="resWhy"></div>
</section>

<section id="data">
  <div class="step">Step 1 · Understand the data</div>
  <h2>What are we predicting?</h2>
  <p>Each row is one house sale. The target is <code>SalePrice</code>. The 80 inputs describe size (living area, basement, lot), quality ratings (overall, kitchen, exterior), age, location (neighbourhood), and the type of sale.</p>
  <div class="grid2">
    <div class="card"><div class="row"><div><div class="ctitle">Distribution of sale prices</div><div class="csub" id="histSub"></div></div><div style="flex:1"></div><div class="seg" id="histMode"></div></div><div class="chart"><canvas id="histChart"></canvas></div></div>
    <div class="card"><div class="ctitle">Which single features track price most closely?</div><div class="csub">Correlation with log(price). 1 = perfectly in step; 0 = unrelated; negative = price falls as the feature rises.</div><div class="chart"><canvas id="corrChart"></canvas></div></div>
  </div>
  <div class="card"><div class="ctitle">Living area vs sale price — notice the oddballs</div><div class="csub">Each dot is a house. Hover for details. The circled houses on the far right are huge but sold cheaply; we come back to them in Step 7.</div><div class="chart tall"><canvas id="scatChart"></canvas></div></div>
  <div class="why"><b>What we did to the data and why.</b>
  <ul class="reason">
    <li><b>Log-transformed the price.</b> Prices are right-skewed (a long tail of expensive homes). Training on log(price) means a $20k miss on a $100k house counts more than a $20k miss on a $600k house — which matches how people think about accuracy. We convert predictions back to dollars before computing every metric on this page.</li>
    <li><b>Turned quality words into numbers</b> (Poor=1 … Excellent=5) so the trees can use their natural order, and gave other text columns (e.g. Neighborhood) integer codes. Trees split on thresholds, so they don’t need one-hot encoding or scaling.</li>
    <li><b>Filled blanks with −1.</b> Many blanks mean “none” (no pool, no garage). Trees can learn that −1 is its own group.</li>
    <li><b>Added four engineered features:</b> total square footage, house age at sale, years since remodel, and total bathrooms. These combine information the trees would otherwise need several splits to find.</li>
    <li><b>Kept the outliers.</b> Many tutorials delete the giant cheap houses. We kept them so you can see how models fail on unusual data.</li>
  </ul></div>
</section>

<section id="split">
  <div class="step">Step 2 · Split the data</div>
  <h2>Training, validation, and test sets</h2>
  <div class="card">
    <div class="bar3" id="splitBar"></div>
    <div class="grid3" style="margin-top:12px">
      <div><b>Training (60%)</b><p>The model learns from these houses. It sees both the features <i>and</i> the price. A low training error only proves the model can memorise.</p></div>
      <div><b>Validation (20%)</b><p>Used to <b>choose settings</b> (tree depth, number of trees, learning rate). We try hundreds of settings and keep the one with the lowest validation RMSE.</p></div>
      <div><b>Test (20%)</b><p>Locked away until the very end. Because we picked settings using validation, validation scores are slightly optimistic. Test is the unbiased final grade.</p></div>
    </div>
  </div>
  <div class="why"><b>Why three sets instead of two?</b> If you tune settings on the test set, you are quietly fitting to it, and the reported score is too good. Think of training as homework, validation as practice exams, and test as the final exam you only sit once. We also ran <b>5-fold cross-validation</b> (Step 6) to check that the result isn’t a lucky split.</div>
</section>

<section id="metrics">
  <div class="step">Step 3 · Decide how to keep score</div>
  <h2>The four success metrics</h2>
  <div class="grid4">
    <div class="card"><div class="ctitle">RMSE</div><div class="formula">√ mean( (pred − actual)² )</div><p>Typical miss in dollars, with big misses penalised heavily (they’re squared). <b>Lower is better.</b> Our main metric for picking settings.</p></div>
    <div class="card"><div class="ctitle">MAE</div><div class="formula">mean( |pred − actual| )</div><p>Average miss in dollars. Easier to explain than RMSE and less dominated by a few disasters. <b>Lower is better.</b></p></div>
    <div class="card"><div class="ctitle">R²</div><div class="formula">1 − SSerror / SStotal</div><p>Share of the variation in prices the model explains. 1.0 = perfect; 0 = no better than guessing the average price. <b>Higher is better.</b></p></div>
    <div class="card"><div class="ctitle">MAPE</div><div class="formula">mean( |pred − actual| / actual )</div><p>Average miss as a % of price. Fair across cheap and expensive homes. <b>Lower is better.</b></p></div>
  </div>
  <div class="why"><b>Read RMSE and MAE together.</b> If RMSE is much bigger than MAE, a handful of houses are being missed by a lot — exactly the failure cases we dig into in Step 7.</div>
</section>

<section id="intuition">
  <div class="step">Step 4 · How each model thinks</div>
  <h2>One feature, three ways of drawing a line</h2>
  <p>To see what the models actually do, we trained each one on a single input (living area) and plot its prediction curve. Drag the slider to add complexity.</p>
  <div class="card">
    <div class="tabs" id="oneTabs"></div>
    <div class="row"><div class="ctl" style="max-width:520px"><label id="oneLbl"></label><input type="range" id="oneSlider"><small id="oneHelp"></small></div></div>
    <div class="chart tall"><canvas id="oneChart"></canvas></div>
    <div class="diag" id="oneText"></div>
  </div>
  <div class="grid2">
    <div class="card"><div class="ctitle">A real decision tree (depth 3, all features)</div><div class="csub">Each box asks a yes/no question. A house follows the arrows to a leaf; the leaf’s average price is the prediction.</div><svg id="treesvg" width="100%" viewBox="0 0 760 370"></svg></div>
    <div class="card">
      <div class="ctitle">The three ideas in plain language</div>
      <h3 style="color:var(--dt)">Decision Tree — one expert</h3><p>Asks a sequence of yes/no questions and predicts the average price of the training houses that end up in the same leaf. Easy to read, but one tree is jumpy: small changes in data change the whole tree (<b>high variance</b>).</p>
      <h3 style="color:var(--rf)">Random Forest — a committee voting in parallel</h3><p>Grows hundreds of deep trees, each on a random resample of houses and a random subset of features, then <b>averages</b> them. Individual trees overfit in different directions, so their errors cancel.</p>
      <h3 style="color:var(--xgb)">XGBoost — a team fixing each other’s mistakes</h3><p>Builds small trees <b>one after another</b>; each new tree predicts what the previous trees got wrong. A learning rate shrinks each step so it creeps up on the answer. Usually the most accurate, but has the most knobs.</p>
    </div>
  </div>
</section>

<section id="playground">
  <div class="step">Step 5 · Tune the settings yourself</div>
  <h2>Hyperparameter playground</h2>
  <p>We trained every combination below in advance (72 decision trees, 480 random-forest settings, 280 XGBoost settings). Move the sliders to look them up. The ★ marks the setting we picked: the lowest validation error measured on log-price (the scale the models train on, and the official Kaggle metric for this data). We use log-error to choose because dollar RMSE on 586 houses can be swung by one or two mansions — try the Random Forest tab and you’ll see dollar RMSE wobble up and down by a few hundred dollars as trees are added. That wobble is noise, not signal.</p>
  <div class="tabs" id="pgTabs"></div>
  <div class="card">
    <div class="row" id="pgCtl"></div>
    <div class="row"><button class="seg" style="padding:6px 12px;cursor:pointer;color:var(--text)" id="pgBest">★ Jump to best setting</button><span class="csub" style="margin:0" id="pgCount"></span></div>
    <div class="diag" id="pgDiag"></div>
    <div class="tablewrap"><table id="pgTable"></table></div>
  </div>
  <div class="grid2">
    <div class="card"><div class="ctitle" id="curveTitle"></div><div class="csub" id="curveSub"></div><div class="chart"><canvas id="curveChart"></canvas></div></div>
    <div class="card"><div class="ctitle" id="heatTitle"></div><div class="csub" id="heatSub"></div><div id="heat"></div><div class="ramp">worse <i></i> better (validation RMSE)</div></div>
  </div>
  <div class="why" id="pgWhy"></div>
</section>

<section id="compare">
  <div class="step">Step 6 · Compare the tuned models</div>
  <h2>Head-to-head</h2>
  <div class="grid2">
    <div class="card"><div class="ctitle">Is the win consistent? 5-fold cross-validation</div><div class="csub">The data is cut into 5 slices; each model is trained 5 times, each time tested on a different slice. Lines that stay apart mean the ranking is real, not luck.</div><div class="row"><div class="seg" id="cvMetric"></div></div><div class="chart short"><canvas id="cvChart"></canvas></div></div>
    <div class="card"><div class="ctitle">Learning curves: does more data help?</div><div class="csub">Solid = validation RMSE, dashed = training RMSE, as we train on more houses. A big gap between the two = overfitting.</div><div class="chart"><canvas id="lcChart"></canvas></div></div>
  </div>
  <div class="card"><div class="row"><div><div class="ctitle">Predicted vs actual price — test set</div><div class="csub">Dots on the diagonal are perfect predictions. Above the line = model guessed too high. Hover any dot.</div></div><div style="flex:1"></div><div class="seg" id="pvaModel"></div></div><div class="chart tall"><canvas id="pvaChart"></canvas></div></div>
  <div class="card"><div class="row"><div><div class="ctitle">What does each model rely on?</div><div class="csub" id="impSub"></div></div><div style="flex:1"></div><div class="seg" id="impModel"></div><div class="seg" id="impKind"></div></div><div class="chart tall"><canvas id="impChart"></canvas></div></div>
</section>

<section id="fail">
  <div class="step">Step 7 · Why models fail</div>
  <h2>Where the errors come from</h2>
  <p>For this section every house gets a prediction from a model that <b>never saw it</b> (5-fold cross-validation, using each model’s tuned settings). That lets us study all 2,930 errors, not just the test set.</p>
  <div class="card"><div class="row"><div><div class="ctitle">Failure 1 · Extremes get pulled toward the middle</div><div class="csub">Error (%) vs actual price. Positive = model guessed too high. Cheap homes are over-predicted and luxury homes under-predicted.</div></div><div style="flex:1"></div><div class="seg" id="resModel"></div></div><div class="chart tall"><canvas id="residChart"></canvas></div>
  <div class="why"><b>Why:</b> a tree predicts the <i>average</i> of the houses in a leaf. The most expensive house in a leaf is always above its leaf average, and the cheapest is always below. All three models show it — check Failure 3: the cheapest 10% of homes have by far the largest % errors. Boosting reduces the effect because each new tree specifically targets the leftover errors, which is one reason XGBoost has the lowest error in both the cheapest and the priciest bands.</div></div>
  <div class="grid2">
    <div class="card"><div class="ctitle">Failure 2 · Unusual sale types</div><div class="csub">Average % error by how the house was sold. “Partial” = new home sold before completion; “Abnorml” = foreclosure, short sale or trade; “Family” = sale between relatives.</div><div class="chart"><canvas id="scChart"></canvas></div></div>
    <div class="card"><div class="ctitle">Failure 3 · Error by price band</div><div class="csub">Average % error within each tenth of the price range (decile 1 = cheapest 10% of homes).</div><div class="chart"><canvas id="decChart"></canvas></div></div>
  </div>
  <div class="card"><div class="ctitle">Failure 4 · Some neighbourhoods are harder than others</div><div class="csub">Average % error by neighbourhood, sorted by XGBoost error. Number of sales in brackets. GrnHill (2 sales) and Landmrk (1 sale) show how hopeless it is to learn a location from almost no examples.</div><div class="chart xtall"><canvas id="nbChart"></canvas></div></div>
  <div class="card">
    <div class="ctitle">Failure 5 · The worst individual misses — click a house</div><div class="csub">The 15 houses with the largest average % error across the three models.</div>
    <div class="tablewrap"><table id="worstTable"></table></div>
    <div id="houseDetail" class="diag" style="margin-top:14px"></div>
  </div>
  <div class="card"><div class="ctitle">Failure 6 · Trees can’t extrapolate</div>
  <p>Go back to <a href="#intuition">Step 4</a> and look at the shaded zone on the right: past the largest house in the training data, every tree-based model draws a <b>flat line</b>. A tree can only output averages of prices it has seen, so a 7,000 sq ft mansion gets the same prediction as the biggest house in training. Linear models would keep extending the trend (sometimes wrongly too). If your future data can fall outside your training range — new luxury builds, inflation, a new neighbourhood — tree models will quietly cap their predictions.</p></div>
  <div class="why" id="failSummary"></div>
</section>

<section id="takeaways">
  <div class="step">Wrap-up</div>
  <h2>Takeaways</h2>
  <div class="card" id="take"></div>
</section>`;

// ---------------------------------------------------------------- RESULTS
(function results() {
  const tiles = MODELS.map(m => {
    const t = F[m].test;
    return `<div class="tile"><div class="lbl"><i class="sw" style="background:${C[m]}"></i>${NAME[m]}</div><div class="val">${money(t[0])}</div><div class="sub">test RMSE · R² ${t[2].toFixed(3)} · typical miss ${t[3].toFixed(1)}%</div></div>`;
  });
  $('#tiles').innerHTML = tiles.join('');
  let mi = 0;
  const render = () => {
    const M = MET[mi];
    draw('resChart', { type: 'bar', data: { labels: SPL.map(s => SPLN[s]), datasets: MODELS.map(m => ({ label: NAME[m], data: SPL.map(s => F[m][s][M.i]), backgroundColor: C[m], borderSkipped: 'start' })) },
      options: { scales: { y: { beginAtZero: true, title: { display: true, text: M.long }, ticks: { callback: v => M.i < 2 ? money(v) : M.i === 3 ? v + '%' : v } }, x: { grid: { display: false } } },
        plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${M.f(c.raw)}` } } }, datasets: { bar: { categoryPercentage: .7, barPercentage: .9 } } } });
  };
  seg($('#resMetric'), MET.map((m, i) => [i, m.k]), 0, v => { mi = +v; render(); }); render();
  let h = '<tr><th>Data split</th><th style="text-align:left">Model</th>' + MET.map(m => `<th>${m.k}</th>`).join('') + '<th style="text-align:left">Tuned settings (★)</th></tr>';
  const setTxt = { dt: k => { const p = k.split('|'); return `max_depth=${p[0] === '0' ? 'None' : p[0]}, min_samples_leaf=${p[1]}`; },
    rf: k => { const p = k.split('|'); return `${p[0]} trees, max_depth=${p[1] === '0' ? 'None' : p[1]}, max_features=${p[2]}, min_samples_leaf=${p[3]}`; },
    xgb: k => { const p = k.split('|'); return `${p[0]} rounds, learning_rate=${p[1]}, max_depth=${p[2]}, subsample=${p[3]}`; } };
  for (const s of SPL) for (const m of MODELS) {
    h += `<tr${m === 'dt' && s !== 'train' ? ' style="border-top:2px solid var(--border)"' : ''}><td>${m === 'dt' ? '<b>' + SPLN[s] + '</b>' : ''}</td><td style="text-align:left"><i class="sw" style="background:${C[m]}"></i> ${NAME[m]}</td>`;
    for (const M of MET) { const vals = MODELS.map(x => F[x][s][M.i]); const best = M.lower ? Math.min(...vals) : Math.max(...vals);
      h += `<td class="${F[m][s][M.i] === best ? 'win' : ''}">${M.f(F[m][s][M.i])}</td>`; }
    h += `<td style="text-align:left;color:var(--muted);font-size:12px">${s === 'train' ? setTxt[m](B[m]) : ''}</td></tr>`;
  }
  $('#resTable').innerHTML = h;
  const order = [...MODELS].sort((a, b) => F[a].test[0] - F[b].test[0]);
  const gap = m => F[m].val[0] - F[m].train[0];
  $('#resWhy').innerHTML = `<b>Reading the scoreboard.</b> On the test set ${NAME[order[0]]} misses by about ${money(F[order[0]].test[1])} on a typical house (MAE), versus ${money(F[order[2]].test[1])} for ${NAME[order[2]]}. ` +
    `Look at the training rows: XGBoost scores ${money(F.xgb.train[0])} and Random Forest ${money(F.rf.train[0])} on houses they learned from, but ${money(F.xgb.val[0])} and ${money(F.rf.val[0])} on validation. Ensembles nearly memorise their training data, and that is fine — training error is never the success metric; validation and test are. ` +
    `The decision tree is worst everywhere: one tree can’t be both deep enough to capture detail and stable enough to generalise. Validation and test scores differ a bit because they are different houses — that’s why we report both.`;
})();

// ---------------------------------------------------------------- DATA
(function data() {
  const P = D.eda.price;
  let mode = 'raw';
  const render = () => {
    const vals = mode === 'raw' ? P : P.map(Math.log);
    const lo = Math.min(...vals), hi = Math.max(...vals), nb = 40, w = (hi - lo) / nb;
    const cnt = Array(nb).fill(0); vals.forEach(v => cnt[Math.min(nb - 1, Math.floor((v - lo) / w))]++);
    const labels = cnt.map((_, i) => mode === 'raw' ? money(lo + (i + .5) * w) : money(Math.exp(lo + (i + .5) * w)));
    draw('histChart', { type: 'bar', data: { labels, datasets: [{ label: 'Houses', data: cnt, backgroundColor: css('--s400'), categoryPercentage: 1, barPercentage: .92 }] },
      options: { plugins: { legend: { display: false }, tooltip: { callbacks: { title: c => 'Around ' + c[0].label, label: c => c.raw + ' houses' } } },
        scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 }, title: { display: true, text: mode === 'raw' ? 'Sale price' : 'Sale price (log scale)' } }, y: { title: { display: true, text: 'Number of houses' } } } } });
    const s = [...P].sort((a, b) => a - b);
    $('#histSub').textContent = mode === 'raw' ? `Median ${usd(s[s.length >> 1])}, range ${usd(s[0])}–${usd(s[s.length - 1])}. Long right tail.` : 'After taking the log, the distribution is close to a symmetric bell — easier to model.';
  };
  seg($('#histMode'), [['raw', 'Dollars'], ['log', 'Log']], 'raw', v => { mode = v; render(); }); render();

  const cr = D.eda.corr.slice(0, 15);
  draw('corrChart', { type: 'bar', data: { labels: cr.map(c => c[0]), datasets: [{ data: cr.map(c => c[1]), backgroundColor: cr.map(c => c[1] < 0 ? css('--rf') : css('--s400')) }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => 'correlation ' + c.raw.toFixed(2) } } }, scales: { x: { min: -1, max: 1 }, y: { grid: { display: false } } } } });

  const sc = D.eda.scatter;
  const odd = p => p[0] > 4000 && p[1] < 300000;
  const norm = sc.filter(p => !odd(p)).map(p => ({ x: p[0], y: p[1] }));
  const big = sc.filter(odd).map(p => ({ x: p[0], y: p[1] }));
  draw('scatChart', { type: 'scatter', data: { datasets: [
    { label: 'House', data: norm, backgroundColor: alpha(css('--s400'), .35), pointRadius: 2.5 },
    { label: 'Huge (4,000+ sq ft) but under $300k', data: big, backgroundColor: css('--bad'), borderColor: css('--surface'), borderWidth: 2, pointRadius: 7, pointHoverRadius: 9 }] },
    options: { plugins: { tooltip: { callbacks: { label: c => `${c.raw.x.toLocaleString()} sq ft → ${usd(c.raw.y)}` } } },
      scales: { x: { title: { display: true, text: 'Above-ground living area (sq ft)' } }, y: { ...dollarAxis, title: { display: true, text: 'Sale price' } } } } });

  const n = D.eda.split_counts, tot = n[0] + n[1] + n[2];
  $('#splitBar').innerHTML = [['Training', n[0], css('--s600')], ['Validation', n[1], css('--s400')], ['Test', n[2], css('--s300')]].map(([l, v, c]) => `<div style="flex:${v};background:${c}">${l} · ${v.toLocaleString()} houses</div>`).join('');
})();

// ---------------------------------------------------------------- INTUITION (1-D)
(function oned() {
  const O = D.oned; let model = 'dt';
  const trainMax = Math.max(...O.pts.map(p => p[0]));
  const cfg = {
    dt: { keys: Object.keys(O.dt).map(Number).sort((a, b) => a - b), lbl: 'max_depth (questions asked)', def: 2,
      help: 'How many yes/no questions in a row the tree may ask. Depth d gives up to 2^d flat steps.',
      txt: k => k <= 2 ? `<b>Underfitting.</b> With depth ${k} the tree can only produce ${2 ** k} price levels — a crude staircase that misses the trend.` : k <= 5 ? `<b>Reasonable.</b> Depth ${k} gives up to ${2 ** k} steps that follow the upward trend while ignoring most noise.` : `<b>Overfitting.</b> Depth ${k} allows up to ${(2 ** k).toLocaleString()} steps. The line starts jumping to chase individual houses — those spikes are memorised noise, and they won’t repeat on new data.` },
    rf: { keys: Object.keys(O.rf).map(Number).sort((a, b) => a - b), lbl: 'n_estimators (trees averaged)', def: 1,
      help: 'Each tree is grown on a random resample of houses. The forest prediction is the average.',
      txt: k => k === 1 ? '<b>One random tree</b> is spiky, like an overfit decision tree.' : k < 25 ? `<b>Averaging ${k} trees</b> already smooths the spikes: each tree overfits a different random sample, so their mistakes partly cancel.` : `<b>${k} trees.</b> The curve has settled into a smooth staircase. Adding more trees no longer changes it — a random forest can’t really overfit by adding trees; it just stops improving.` },
    xgb: { keys: Object.keys(O.xgb).map(Number).sort((a, b) => a - b), lbl: 'boosting rounds (trees added in sequence)', def: 1,
      help: 'Each round adds a small depth-2 tree that predicts the remaining error, scaled by learning rate 0.1.',
      txt: k => k <= 3 ? `<b>${k} round${k > 1 ? 's' : ''}.</b> Boosting starts from the average price and takes small steps. Early on it barely moves — underfitting.` : k <= 100 ? `<b>${k} rounds.</b> Each tree corrected part of the remaining error; the curve now tracks the trend closely.` : `<b>${k} rounds.</b> Unlike a forest, boosting <i>can</i> overfit by adding trees: late rounds start fitting tiny wiggles. That’s why we use validation data to decide when to stop.` }
  };
  $('#oneTabs').innerHTML = MODELS.map(m => `<button data-m="${m}" class="${m === model ? 'on' : ''}"><i class="sw" style="background:${C[m]}"></i>${NAME[m]}</button>`).join('');
  const sl = $('#oneSlider');
  const render = () => {
    const c = cfg[model], k = c.keys[+sl.value];
    $('#oneLbl').innerHTML = `${c.lbl} <span>${k}</span>`; $('#oneHelp').textContent = c.help;
    const line = O.x.map((x, i) => ({ x, y: O[model][k][i] }));
    draw('oneChart', { type: 'scatter', data: { datasets: [
      { label: NAME[model] + ' prediction', type: 'line', data: line, borderColor: C[model], stepped: false, borderWidth: 2.5, order: 0 },
      { label: 'Training houses', data: O.pts.map(p => ({ x: p[0], y: p[1] })), backgroundColor: alpha(css('--muted'), .3), pointRadius: 2, order: 1 }] },
      options: { plugins: { tooltip: { filter: t => t.datasetIndex === 0, callbacks: { label: t => `${t.raw.x.toLocaleString()} sq ft → ${usd(t.raw.y)}` } } },
        scales: { x: { type: 'linear', min: 300, max: 7000, title: { display: true, text: 'Living area (sq ft)' } }, y: { ...dollarAxis, min: 0, max: 650000, title: { display: true, text: 'Price' } } } },
      plugins: [{ id: 'extrap', beforeDatasetsDraw(ch) { const { ctx, chartArea: a, scales: { x } } = ch; const px = x.getPixelForValue(trainMax);
        ctx.save(); ctx.fillStyle = alpha(css('--bad'), .08); ctx.fillRect(px, a.top, a.right - px, a.bottom - a.top);
        ctx.fillStyle = css('--bad'); ctx.font = '12px sans-serif'; ctx.fillText('No training houses this big →', px + 8, a.top + 16); ctx.fillText('prediction is flat', px + 8, a.top + 32); ctx.restore(); } }] });
    $('#oneText').innerHTML = c.txt(k);
  };
  const setModel = m => { model = m; sl.min = 0; sl.max = cfg[m].keys.length - 1; sl.step = 1; sl.value = cfg[m].def; [...$('#oneTabs').children].forEach(b => b.classList.toggle('on', b.dataset.m === m)); render(); };
  $('#oneTabs').onclick = e => { const b = e.target.closest('button'); if (b) setModel(b.dataset.m); };
  sl.oninput = render; setModel('dt');

  // tree diagram
  const T = D.tree, svg = $('#treesvg'); let s = '';
  const pos = {}; const W = 760;
  (function lay(i, depth, x0, x1) { pos[i] = { x: (x0 + x1) / 2, y: 18 + depth * 100 }; if (T[i].l !== -1) { lay(T[i].l, depth + 1, x0, (x0 + x1) / 2); lay(T[i].r, depth + 1, (x0 + x1) / 2, x1); } })(0, 0, 0, W);
  T.forEach((n, i) => { if (n.l !== -1) for (const [c, lab] of [[n.l, 'yes'], [n.r, 'no']]) s += `<line x1="${pos[i].x}" y1="${pos[i].y + 40}" x2="${pos[c].x}" y2="${pos[c].y}" stroke="${css('--border')}" stroke-width="1.5"/><text class="sub" x="${(pos[i].x + pos[c].x) / 2 + (lab === 'yes' ? -14 : 4)}" y="${(pos[i].y + 40 + pos[c].y) / 2}">${lab}</text>`; });
  T.forEach((n, i) => { const { x, y } = pos[i]; const leaf = n.l === -1; const w = leaf ? 88 : 176;
    s += `<rect x="${x - w / 2}" y="${y}" width="${w}" height="40" rx="6" fill="${leaf ? alpha(C.dt, .14) : css('--surface-2')}" stroke="${leaf ? C.dt : css('--border')}"/>`;
    s += leaf ? `<text x="${x}" y="${y + 17}" text-anchor="middle" font-weight="700">${money(n.v)}</text><text class="sub" x="${x}" y="${y + 33}" text-anchor="middle">${n.n} houses</text>`
      : `<text x="${x}" y="${y + 17}" text-anchor="middle" font-weight="600">${n.f} ≤ ${n.th}?</text><text class="sub" x="${x}" y="${y + 33}" text-anchor="middle">${n.n} houses · avg ${money(n.v)}</text>`; });
  svg.innerHTML = s;
})();

// ---------------------------------------------------------------- PLAYGROUND
(function playground() {
  const lab = v => v === 0 ? 'None' : v;
  const SPEC = {
    dt: { P: D.dt.params, order: ['max_depth', 'min_samples_leaf'], key: s => `${s.max_depth}|${s.min_samples_leaf}`, grid: D.dt.grid,
      help: { max_depth: 'Max number of questions from root to leaf. “None” = grow until leaves are pure.', min_samples_leaf: 'Each leaf must contain at least this many training houses. Bigger = smoother, less memorising.' } },
    rf: { P: D.rf.params, order: ['n_estimators', 'max_depth', 'max_features', 'min_samples_leaf'], key: s => `${s.n_estimators}|${s.max_depth}|${pf(s.max_features)}|${s.min_samples_leaf}`, grid: D.rf.grid,
      help: { n_estimators: 'How many trees are averaged.', max_depth: 'Depth limit for each tree. Forests usually like deep trees.', max_features: 'Share of features each split may consider. Lower = more diverse (less correlated) trees.', min_samples_leaf: 'Minimum houses per leaf in each tree.' } },
    xgb: { P: D.xgb.params, order: ['n_estimators', 'learning_rate', 'max_depth', 'subsample'], key: s => `${s.n_estimators}|${pf(s.learning_rate)}|${s.max_depth}|${pf(s.subsample)}`, grid: D.xgb.grid,
      help: { n_estimators: 'Number of boosting rounds (trees added in sequence).', learning_rate: 'How big a step each new tree takes. Small = slow but careful; needs more rounds.', max_depth: 'Depth of each small tree. 2–4 is typical for boosting.', subsample: 'Share of houses (and features) each tree sees. Below 1.0 adds randomness that fights overfitting.' } } };
  const state = {};
  const parse = (m, k) => { const p = k.split('|').map(Number); const o = {}; SPEC[m].order.forEach((n, i) => o[n] = p[i]); return o; };
  MODELS.forEach(m => state[m] = parse(m, B[m]));
  let model = 'xgb';
  $('#pgTabs').innerHTML = MODELS.map(m => `<button data-m="${m}"><i class="sw" style="background:${C[m]}"></i>${NAME[m]}</button>`).join('');
  $('#pgTabs').onclick = e => { const b = e.target.closest('button'); if (b) { model = b.dataset.m; build(); } };
  $('#pgBest').onclick = () => { state[model] = parse(model, B[model]); build(); };
  const bestVal = m => SPEC[m].grid[B[m]].val[0];

  function build() {
    [...$('#pgTabs').children].forEach(b => b.classList.toggle('on', b.dataset.m === model));
    const S = SPEC[model];
    $('#pgCtl').innerHTML = S.order.map(n => `<div class="ctl"><label>${n} <span id="v_${n}"></span></label><input type="range" min="0" max="${S.P[n].length - 1}" step="1" id="s_${n}" value="${S.P[n].indexOf(state[model][n])}"><small>${S.help[n]}</small></div>`).join('');
    S.order.forEach(n => { $('#s_' + n).oninput = e => { state[model][n] = S.P[n][+e.target.value]; update(); }; });
    $('#pgCount').textContent = `${Object.keys(S.grid).length} pre-trained ${NAME[model]} settings`;
    update();
  }
  function update() {
    const S = SPEC[model], st = state[model], r = S.grid[S.key(st)];
    S.order.forEach(n => $('#v_' + n).textContent = lab(st[n]) + (S.key(st) === B[model] ? ' ★' : ''));
    // metrics table
    let h = '<tr><th>Data split</th>' + MET.map(M => `<th>${M.k}</th>`).join('') + '<th>Validation RMSE vs ★</th></tr>';
    for (const s of SPL) h += `<tr><td>${SPLN[s]}</td>` + MET.map(M => `<td>${M.f(r[s][M.i])}</td>`).join('') + `<td>${s === 'val' ? (S.key(st) === B[model] ? '★ chosen' : (r.val[0] >= bestVal(model) ? '+' : '−') + money(Math.abs(r.val[0] - bestVal(model)))) : ''}</td></tr>`;
    $('#pgTable').innerHTML = h;
    // diagnosis
    const tr = r.train[0], va = r.val[0], bv = bestVal(model), ratio = tr / va;
    let d;
    if (va > bv * 1.3 && ratio > 0.75) d = `<b style="color:var(--bad)">Underfitting.</b> Training and validation errors are both high (${money(tr)} vs ${money(va)}). The model is too simple to capture the pattern — it would do just as badly on homework as on the exam. Try more depth, more trees/rounds, or a higher learning rate.`;
    else if (ratio < 0.55 && va > bv * 1.08) d = `<b style="color:var(--bad)">Overfitting.</b> Training error (${money(tr)}) is far below validation error (${money(va)}). The model has memorised the training houses, including their noise. Try limiting depth, requiring more houses per leaf, or (for XGBoost) fewer rounds / lower learning rate.`;
    else if (va <= bv * 1.03) d = `<b style="color:var(--good)">Good fit.</b> Validation RMSE ${money(va)} is within 3% of the ★ setting for this model. ${ratio < 0.55 ? 'Training error is much lower than validation, but for ensembles that’s expected — what matters is that validation is low.' : ''}`;
    else d = `<b>Okay, not optimal.</b> Validation RMSE ${money(va)} is ${((va / bv - 1) * 100).toFixed(0)}% worse than the ★ setting (${money(bv)}). Train/validation ratio ${ratio.toFixed(2)}.`;
    if (model === 'dt') d += ` <span class="pill">${r.leaves.toLocaleString()} leaves · depth ${r.depth}</span>`;
    $('#pgDiag').innerHTML = d;
    curve(); heat();
    $('#pgWhy').innerHTML = {
      dt: '<b>What to try:</b> set min_samples_leaf to 1 and slide max_depth to None. Training error drops to nearly $0 (every house gets its own leaf) while validation error climbs — textbook overfitting. Now raise min_samples_leaf: the gap closes. The best tree sits in the middle — the <b>bias–variance trade-off</b>.',
      rf: '<b>What to try:</b> drag n_estimators from 1 to 400 — validation error falls fast then flattens; it never turns back up. Then compare max_features 1.0 vs 0.33: when every tree can see every feature, the trees look alike and averaging helps less. Notice training error is always much lower than validation — normal for forests.',
      xgb: '<b>What to try:</b> set learning_rate 0.3 and max_depth 8, then increase rounds — validation error bottoms out early and then creeps up (overfitting). With learning_rate 0.01, 100 rounds is badly underfit, but 2,000 rounds is excellent. Small steps + many rounds generally wins; it just costs more training time.' }[model];
  }
  function curve() {
    const st = state[model]; let x, tr, va, cur, logx = false, xl;
    if (model === 'dt') {
      const ds = D.dt.params.max_depth; x = ds.map(lab); xl = 'max_depth';
      tr = ds.map(d => D.dt.grid[`${d}|${st.min_samples_leaf}`].train[0]); va = ds.map(d => D.dt.grid[`${d}|${st.min_samples_leaf}`].val[0]); cur = ds.indexOf(st.max_depth);
      $('#curveTitle').textContent = 'Error vs tree depth'; $('#curveSub').textContent = `min_samples_leaf = ${st.min_samples_leaf}. Dashed = training, solid = validation. Ring = your setting.`;
    } else {
      const cv = model === 'rf' ? D.rf.curves[`${st.max_depth}|${pf(st.max_features)}|${st.min_samples_leaf}`] : D.xgb.curves[`${pf(st.learning_rate)}|${st.max_depth}|${pf(st.subsample)}`];
      x = cv.n; tr = cv.train; va = cv.val; logx = true; xl = model === 'rf' ? 'Number of trees (log scale)' : 'Boosting rounds (log scale)';
      cur = x.indexOf(st.n_estimators);
      $('#curveTitle').textContent = model === 'rf' ? 'Error as trees are added' : 'Error as boosting rounds are added';
      $('#curveSub').textContent = 'Dashed = training, solid = validation. Ring = your n_estimators. Other settings held at your slider values.';
    }
    const pts = a => x.map((v, i) => ({ x: logx ? v : i, y: a[i] }));
    const ring = cur >= 0 ? [{ x: logx ? x[cur] : cur, y: va[cur] }] : (() => { const r = SPEC[model].grid[SPEC[model].key(st)]; return [{ x: st.n_estimators, y: r.val[0] }]; })();
    draw('curveChart', { type: 'line', data: { datasets: [
      { label: 'Validation', data: pts(va), borderColor: C[model], backgroundColor: C[model] },
      { label: 'Training', data: pts(tr), borderColor: C[model], borderDash: [5, 4], backgroundColor: C[model] },
      { label: 'Your setting', data: ring, type: 'scatter', pointRadius: 8, pointHoverRadius: 9, backgroundColor: css('--surface'), borderColor: css('--text'), borderWidth: 2.5 }] },
      options: { interaction: { mode: 'nearest', axis: 'x', intersect: false }, plugins: { tooltip: { callbacks: { title: c => logx ? xl.split(' (')[0] + ': ' + c[0].raw.x : 'max_depth: ' + x[c[0].raw.x], label: c => `${c.dataset.label}: ${money(c.raw.y)}` } } },
        scales: { x: logx ? { type: 'logarithmic', title: { display: true, text: xl }, ticks: { callback: v => [1, 10, 100, 1000].includes(v) ? v : '' } } : { type: 'linear', min: 0, max: x.length - 1, ticks: { stepSize: 1, callback: v => x[v] }, title: { display: true, text: xl } },
          y: { ...dollarAxis, beginAtZero: true, title: { display: true, text: 'RMSE' } } } } });
  }
  function heat() {
    const st = state[model]; let rows, cols, rn, cn, get;
    if (model === 'dt') { rn = 'max_depth'; cn = 'min_samples_leaf'; }
    else if (model === 'rf') { rn = 'max_depth'; cn = 'max_features'; }
    else { rn = 'learning_rate'; cn = 'n_estimators'; }
    rows = SPEC[model].P[rn]; cols = SPEC[model].P[cn];
    get = (r, c) => SPEC[model].grid[SPEC[model].key({ ...st, [rn]: r, [cn]: c })].val[0];
    const all = rows.flatMap(r => cols.map(c => get(r, c))); const lo = Math.min(...all), hi = Math.max(...all);
    const ramp = ['--s100', '--s200', '--s300', '--s400', '--s500', '--s600', '--s700'].map(css);
    const color = v => { const t = 1 - (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo) || 1); return ramp[Math.min(6, Math.floor(t * 6.999))]; };
    let h = `<div class="heat" style="grid-template-columns:90px repeat(${cols.length},1fr)"><div class="hd">${rn} ↓ ${cn} →</div>` + cols.map(c => `<div class="hd">${lab(c)}</div>`).join('');
    for (const r of rows) { h += `<div class="hd" style="text-align:right;padding-right:8px">${lab(r)}</div>`;
      for (const c of cols) { const v = get(r, c), bg = color(v), dark = ramp.indexOf(bg) >= 4, sel = r === st[rn] && c === st[cn];
        h += `<div class="cell ${sel ? 'sel' : ''}" data-r="${r}" data-c="${c}" title="${rn}=${lab(r)}, ${cn}=${lab(c)}: validation RMSE ${usd(v)}" style="background:${bg};color:${dark ? '#fff' : '#0b0b0b'}">${(v / 1000).toFixed(1)}k</div>`; } }
    $('#heat').innerHTML = h + '</div>';
    $('#heat').onclick = e => { const c = e.target.closest('.cell'); if (!c) return; st[rn] = +c.dataset.r; st[cn] = +c.dataset.c; build(); };
    const fixed = SPEC[model].order.filter(n => n !== rn && n !== cn).map(n => `${n}=${lab(st[n])}`).join(', ');
    $('#heatTitle').textContent = `Validation RMSE map: ${rn} × ${cn}`;
    $('#heatSub').textContent = `Darker = lower error. Click a cell to load that setting.${fixed ? ' Holding ' + fixed + '.' : ''}`;
  }
  build();
})();

// ---------------------------------------------------------------- HEAD TO HEAD
(function compare() {
  let mi = 0;
  const rcv = () => { const M = MET[mi];
    draw('cvChart', { type: 'line', data: { labels: [1, 2, 3, 4, 5].map(i => 'Fold ' + i), datasets: MODELS.map(m => ({ label: NAME[m], data: D.cv[m].map(r => r[M.i]), borderColor: C[m], backgroundColor: C[m], pointRadius: 4, pointBorderColor: css('--surface'), pointBorderWidth: 2 })) },
      options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${M.f(c.raw)}` } } }, scales: { y: { title: { display: true, text: M.long }, ticks: { callback: v => M.i < 2 ? money(v) : M.i === 3 ? v + '%' : v } }, x: { grid: { display: false } } } } }); };
  seg($('#cvMetric'), MET.map((m, i) => [i, m.k]), 0, v => { mi = +v; rcv(); }); rcv();

  const L = D.learning;
  draw('lcChart', { type: 'line', data: { datasets: MODELS.flatMap(m => [
    { label: NAME[m] + ' (validation)', data: L[m].n.map((n, i) => ({ x: n, y: L[m].val[i] })), borderColor: C[m], backgroundColor: C[m], pointRadius: 3 },
    { label: NAME[m] + ' (training)', data: L[m].n.map((n, i) => ({ x: n, y: L[m].train[i] })), borderColor: C[m], backgroundColor: C[m], borderDash: [5, 4] }]) },
    options: { interaction: { mode: 'nearest', axis: 'x', intersect: false }, plugins: { legend: { labels: { filter: i => i.text.includes('validation'), generateLabels: ch => Chart.defaults.plugins.legend.labels.generateLabels(ch).filter(l => l.text.includes('validation')).map(l => ({ ...l, text: l.text.replace(' (validation)', '') })) } }, tooltip: { callbacks: { title: c => c[0].raw.x + ' training houses', label: c => `${c.dataset.label}: ${money(c.raw.y)}` } } },
      scales: { x: { type: 'linear', title: { display: true, text: 'Number of training houses' } }, y: { ...dollarAxis, beginAtZero: true, title: { display: true, text: 'RMSE' } } } } });

  const test = H.filter(h => h.split === 'test');
  let pm = 'xgb';
  const rpva = () => {
    draw('pvaChart', { type: 'scatter', data: { datasets: [
      { label: 'Perfect prediction', type: 'line', data: [{ x: 0, y: 0 }, { x: 760000, y: 760000 }], borderColor: css('--muted'), borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0 },
      { label: NAME[pm], data: test.map(h => ({ x: h.price, y: h.ts[pm], h })), backgroundColor: alpha(C[pm], .55), borderColor: alpha(C[pm], .9), borderWidth: 1, pointRadius: 3.5 }] },
      options: { plugins: { tooltip: { filter: t => t.datasetIndex === 1, callbacks: { title: c => `${c[0].raw.h.nb} · ${c[0].raw.h.liv.toLocaleString()} sq ft · built ${c[0].raw.h.yb}`, label: c => [`Actual ${usd(c.raw.x)}`, `Predicted ${usd(c.raw.y)} (${((c.raw.y / c.raw.x - 1) * 100).toFixed(0)}%)`, `Sale: ${c.raw.h.sc}`] } } },
        scales: { x: { ...dollarAxis, min: 0, max: 760000, title: { display: true, text: 'Actual price' } }, y: { ...dollarAxis, min: 0, max: 760000, title: { display: true, text: 'Predicted price' } } } } });
  };
  seg($('#pvaModel'), MODELS.map(m => [m, NAME[m]]), pm, v => { pm = v; rpva(); }); rpva();

  let im = 'xgb', ik = 'perm';
  const rimp = () => {
    const src = (ik === 'perm' ? D.perm : D.importance)[im];
    $('#impSub').innerHTML = ik === 'perm' ? 'Permutation importance: how much validation error rises when we shuffle that feature (breaking its link to price). Model-agnostic, so it’s fair to compare across models.' : 'Built-in importance: how much each feature reduced error inside the trees (sums to 1). Fast, but can favour features with many distinct values.';
    draw('impChart', { type: 'bar', data: { labels: src.map(s => s[0]), datasets: [{ label: NAME[im], data: src.map(s => s[1]), backgroundColor: C[im] }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw.toFixed(4) } } }, scales: { y: { grid: { display: false } }, x: { title: { display: true, text: ik === 'perm' ? 'Increase in error (log-price units)' : 'Share of total importance' } } } } });
  };
  seg($('#impModel'), MODELS.map(m => [m, NAME[m]]), im, v => { im = v; rimp(); });
  seg($('#impKind'), [['perm', 'Permutation'], ['builtin', 'Built-in']], ik, v => { ik = v; rimp(); }); rimp();
})();

// ---------------------------------------------------------------- FAILURES
(function fail() {
  const ape = (h, m) => Math.abs(h.p[m] / h.price - 1) * 100;
  const err = (h, m) => (h.p[m] / h.price - 1) * 100;
  let rm = 'xgb';
  const rres = () => {
    draw('residChart', { type: 'scatter', data: { datasets: [
      { label: NAME[rm], data: H.map(h => ({ x: h.price, y: err(h, rm), h })), backgroundColor: alpha(C[rm], .4), pointRadius: 2.5 }] },
      options: { plugins: { legend: { display: false }, tooltip: { callbacks: { title: c => `${c[0].raw.h.nb} · ${c[0].raw.h.sc} sale`, label: c => [`Actual ${usd(c.raw.x)}`, `Predicted ${usd(c.raw.h.p[rm])}`, `Error ${c.raw.y.toFixed(0)}%`] } } },
        scales: { x: { ...dollarAxis, type: 'logarithmic', title: { display: true, text: 'Actual price (log scale)' }, ticks: { callback: v => [25000, 50000, 100000, 200000, 400000, 800000].includes(v) ? money(v) : '' } }, y: { min: -80, max: 200, title: { display: true, text: 'Prediction error (%)' }, grid: { color: c => c.tick.value === 0 ? css('--muted') : css('--grid') } } } } });
  };
  seg($('#resModel'), MODELS.map(m => [m, NAME[m]]), rm, v => { rm = v; rres(); }); rres();

  const grp = (key) => { const g = {}; H.forEach(h => (g[key(h)] = g[key(h)] || []).push(h)); return g; };
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const bars = (id, labels, groups, opts = {}) => draw(id, { type: 'bar', data: { labels, datasets: MODELS.map(m => ({ label: NAME[m], data: groups.map(g => mean(g.map(h => ape(h, m)))), backgroundColor: C[m] })) },
    options: { indexAxis: opts.y ? 'y' : 'x', datasets: { bar: { categoryPercentage: .75, barPercentage: .9 } }, interaction: { mode: 'index', axis: opts.y ? 'y' : 'x', intersect: false }, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw.toFixed(1)}%` } } },
      scales: { [opts.y ? 'x' : 'y']: { beginAtZero: true, title: { display: true, text: 'Average % error' }, ticks: { callback: v => v + '%' } }, [opts.y ? 'y' : 'x']: { grid: { display: false } } } } });

  const sc = grp(h => h.sc); const scK = Object.keys(sc).sort((a, b) => sc[b].length - sc[a].length);
  bars('scChart', scK.map(k => `${k} (${sc[k].length})`), scK.map(k => sc[k]));
  const sorted = [...H].sort((a, b) => a.price - b.price); const dec = Array.from({ length: 10 }, (_, i) => sorted.slice(Math.floor(i * H.length / 10), Math.floor((i + 1) * H.length / 10)));
  bars('decChart', dec.map((d, i) => [`D${i + 1}`, `${money(d[0].price).replace('.0k','k')}–${money(d[d.length - 1].price).replace('.0k','k')}`]), dec);
  const nb = grp(h => h.nb); const nbK = Object.keys(nb).sort((a, b) => mean(nb[b].map(h => ape(h, 'xgb'))) - mean(nb[a].map(h => ape(h, 'xgb'))));
  bars('nbChart', nbK.map(k => `${k} (${nb[k].length})`), nbK.map(k => nb[k]), { y: true });

  // worst houses
  const avgApe = h => mean(MODELS.map(m => ape(h, m)));
  const worst = [...H].sort((a, b) => avgApe(b) - avgApe(a)).slice(0, 15);
  const nbMed = {}; Object.entries(nb).forEach(([k, v]) => { const p = v.map(h => h.price).sort((a, b) => a - b), l = v.map(h => h.liv).sort((a, b) => a - b); nbMed[k] = { p: p[p.length >> 1], l: l[l.length >> 1], n: v.length }; });
  const ps = sorted.map(h => h.price), p5 = ps[Math.floor(.05 * ps.length)], p95 = ps[Math.floor(.95 * ps.length)];
  const livMax = Math.max(...H.filter(h => h.split === 'train').map(h => h.liv));
  const reasons = h => {
    const r = [], nm = nbMed[h.nb], dir = MODELS.map(m => Math.sign(h.p[m] - h.price));
    if (h.sc === 'Partial') r.push('<b>Partial sale</b> — a new home sold before it was finished. The recorded price may not reflect the finished house the features describe.');
    if (h.sc === 'Abnorml') r.push('<b>Abnormal sale</b> (foreclosure, short sale or trade). The price reflects the seller’s situation, not just the house — nothing in the features tells the model that.');
    if (h.sc === 'Family' || h.sc === 'Alloca' || h.sc === 'AdjLand') r.push(`<b>Non-market sale (${h.sc})</b> — e.g. between relatives or land-assembly deals. Prices can be far from market value.`);
    if (h.liv > 4000) r.push(`<b>Enormous house</b> (${h.liv.toLocaleString()} sq ft). Almost no training examples are this big, so the model has little to go on — and trees can’t extrapolate.`);
    if (h.price < nm.p * 0.55 && h.liv >= nm.l) r.push(`<b>Big house, low price.</b> It is larger than the ${h.nb} median (${nm.l.toLocaleString()} sq ft) yet sold for well under the neighbourhood median (${usd(nm.p)}). Everything the model can see says “expensive”.`);
    if (h.price < p5) r.push(`<b>Bottom 5% of prices.</b> Leaves average over several houses, so the cheapest homes get pulled up toward their neighbours’ prices.`);
    if (h.price > p95) r.push(`<b>Top 5% of prices.</b> Leaves average over several houses, so the priciest homes get pulled down.`);
    if (nm.n < 30) r.push(`<b>Rare neighbourhood</b> — only ${nm.n} sales in ${h.nb}, so location effects are poorly learned.`);
    if (h.oc <= 3) r.push(`<b>Poor condition rating (${h.oc}/10).</b> Few houses are rated this low, and condition is hard to price.`);
    if (h.q >= 8 && h.price < nm.p) r.push(`<b>Quality mismatch.</b> Rated ${h.q}/10 for quality yet cheaper than its neighbourhood’s median.`);
    if (dir.every(d => d === dir[0])) r.push(`<b>All three models miss in the same direction</b> (${dir[0] > 0 ? 'too high' : 'too low'}). When very different algorithms agree, the problem is usually the data point, not the algorithm.`);
    if (!r.length) r.push('No single obvious cause — likely something the data doesn’t record (interior condition, a recent renovation, a motivated seller).');
    return r;
  };
  let sel = 0;
  const rT = () => {
    let h = '<tr><th>House</th><th>Neighbourhood</th><th>Sale type</th><th>Sq ft</th><th>Quality</th><th>Actual</th>' + MODELS.map(m => `<th><i class="sw" style="background:${C[m]}"></i> ${NAME[m]}</th>`).join('') + '</tr>';
    worst.forEach((w, i) => { h += `<tr class="pick ${i === sel ? 'on' : ''}" data-i="${i}"><td>#${w.id}</td><td>${w.nb}</td><td>${w.sc}</td><td>${w.liv.toLocaleString()}</td><td>${w.q}/10</td><td>${usd(w.price)}</td>` + MODELS.map(m => `<td>${usd(w.p[m])} <span style="color:var(--muted)">(${err(w, m) > 0 ? '+' : ''}${err(w, m).toFixed(0)}%)</span></td>`).join('') + '</tr>'; });
    $('#worstTable').innerHTML = h;
    const w = worst[sel];
    $('#houseDetail').innerHTML = `<b>House #${w.id} — why the models got it wrong</b>
      <div class="kv"><div><span>Actual price</span>${usd(w.price)}</div><div><span>${w.nb} median price</span>${usd(nbMed[w.nb].p)}</div><div><span>Living area / total sq ft</span>${w.liv.toLocaleString()} / ${w.sf.toLocaleString()}</div><div><span>Built · sold</span>${w.yb} · ${w.ys}</div>
      <div><span>Overall quality / condition</span>${w.q}/10 · ${w.oc}/10</div><div><span>Type · style</span>${w.bt} · ${w.hs}</div><div><span>Lot area</span>${w.lot.toLocaleString()} sq ft</div><div><span>Garage cars</span>${w.gc}</div></div>
      <ul class="reason">${reasons(w).map(x => `<li>${x}</li>`).join('')}</ul>`;
  };
  $('#worstTable').onclick = e => { const r = e.target.closest('tr.pick'); if (r) { sel = +r.dataset.i; rT(); } };
  worst.forEach(w => w.ys = w.ys || '—');
  rT();

  const partial = sc.Partial || [], normal = sc.Normal || [];
  const abn = sc.Abnorml || [];
  $('#failSummary').innerHTML = `<b>Summary of failure modes.</b> (1) <b>Regression to the mean</b>: extreme prices are pulled toward the average. (2) <b>Unusual sales</b>: abnormal sales are missed by ${mean(abn.map(h => ape(h, 'xgb'))).toFixed(1)}% on average (XGBoost) vs ${mean(normal.map(h => ape(h, 'xgb'))).toFixed(1)}% for normal sales — the price depends on things not in the data. (3) <b>Sparse regions</b>: rare neighbourhoods and rare house types have few examples. (4) <b>Bad or misleading records</b>: the giant partial-sale houses in Edwards are probably recorded before completion. (5) <b>Extrapolation</b>: trees cap predictions at the training range. (6) <b>Overfitting</b>: an unconstrained decision tree memorises noise (Step 5). Better algorithms fix (6) and help with (1), but (2)–(5) are <i>data</i> problems — no model can learn what the features don’t contain.`;
})();

// ---------------------------------------------------------------- TAKEAWAYS
(function take() {
  const o = [...MODELS].sort((a, b) => F[a].test[0] - F[b].test[0]);
  const imp = (F.dt.test[0] - F[o[0]].test[0]) / F.dt.test[0] * 100;
  $('#take').innerHTML = `<ul class="reason">
    <li><b>${NAME[o[0]]} wins</b> with a test RMSE of ${money(F[o[0]].test[0])} and R² of ${F[o[0]].test[2].toFixed(3)} — about ${imp.toFixed(0)}% lower error than a single decision tree. ${NAME[o[1]]} is close behind (${money(F[o[1]].test[0])}).</li>
    <li><b>Ensembles beat single trees</b> because averaging (Random Forest) or sequential error-correction (XGBoost) cancels out the high variance of one tree.</li>
    <li><b>Training scores are not success metrics.</b> A fully grown tree scores near-perfect on training data and badly on new data. Always judge on validation/test.</li>
    <li><b>Tune on validation, report on test.</b> The validation set chose the ★ settings; the test set was only used once, for the final scores.</li>
    <li><b>Random Forest is the easy, safe choice</b> (adding trees never hurts; defaults work well). <b>XGBoost</b> usually squeezes out more accuracy but needs tuning — learning rate and number of rounds interact strongly.</li>
    <li><b>The biggest errors are data problems</b>: abnormal sales, partial sales of unfinished homes, extreme houses, and rare neighbourhoods. In practice you would filter non-market sales or add features that capture them before switching algorithms.</li></ul>`;
})();
})();
