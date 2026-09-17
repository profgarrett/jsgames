import React, { useMemo, useState } from 'react';

import './HunterConfidenceWidget.css';

/*
	Interactive companion to the confusion-matrix / precision-recall / ROC-AUC
	sections of ml03-category-prediction. See
	static/pages/course_model/ml03-category-prediction/PLAN-confidence-widget.md
	for the design this implements.

	Two independent controls, on purpose, because students often conflate
	them:
	  - the THRESHOLD slider moves the operating point along a single
	    ROC curve (same model, different cutoff).
	  - the EQUIPMENT (scope) selector swaps in a different model entirely --
	    same 25 animals, same true species, but a different confidence score
	    per animal, which traces an entirely different ROC curve with its own
	    (fixed) AUC.

	Both the animal roster and each scope's confidence scores are FIXED --
	the same for every student, every page load -- so a class can compare
	notes. Screen position (jitter) is derived deterministically from each
	animal's id, not Math.random(), for the same reason.

	Embedded into the reading via a fenced code block with the language tag
	`widget-hunter-confidence` -- see the WIDGETS map in PageCodeBlock.tsx.
	rehype-sanitize strips raw <script>/<input> tags before they ever reach
	the DOM (see PageView.tsx), so this has to be a real React component
	rather than HTML/JS embedded directly in the markdown.
*/

type Species = 'deer' | 'frog';
type ScopeId = 'none' | 'basic' | 'high-powered';

interface IAnimal {
	id: number;
	species: Species;
	confidence: number; // 0-100, hidden "how deer-like is this" score
}

interface IScopeConfig {
	id: ScopeId;
	label: string;
	blurb: string;
	// Same order every time: 13 deer confidences, then 12 frog confidences.
	// Index i is "the same animal" across every scope's arrays -- only the
	// confidence score assigned to it changes.
	deer: number[];
	frog: number[];
}

/*
	Three fixed equipment options, same 25 animals underneath. `none` is
	built to land near AUC 0.5 -- barely better than a coin flip, matching
	the page's own AUC-interpretation list. `basic` is the widget's original
	dataset (AUC ~0.88). `high-powered` separates the classes almost
	perfectly (AUC ~0.99) but keeps one hard case on each side, since a real
	model -- even a very good one -- is rarely flawless.
*/
const SCOPES: IScopeConfig[] = [
	{
		id: 'none',
		label: 'No scope',
		blurb: 'guessing from a distance -- barely better than a coin flip',
		deer: [52, 61, 44, 68, 39, 57, 71, 35, 63, 48, 55, 42, 66],
		frog: [58, 46, 64, 40, 53, 37, 60, 49, 43, 67, 34, 51],
	},
	{
		id: 'basic',
		label: 'Basic scope',
		blurb: 'a decent model -- makes real mistakes, but clearly better than guessing',
		deer: [97, 94, 91, 88, 85, 82, 78, 74, 69, 63, 55, 41, 22],
		frog: [78, 66, 52, 44, 38, 33, 28, 24, 19, 14, 9, 4],
	},
	{
		id: 'high-powered',
		label: 'High-powered scope',
		blurb: 'near-perfect separation -- still not flawless',
		deer: [99, 98, 97, 96, 95, 93, 92, 90, 88, 86, 83, 79, 25],
		frog: [70, 38, 22, 18, 15, 12, 10, 8, 6, 5, 4, 2],
	},
];

const TOTAL_DEER = SCOPES[0].deer.length; // 13, same for every scope
const TOTAL_FROG = SCOPES[0].frog.length; // 12, same for every scope

const buildAnimals = (config: IScopeConfig): IAnimal[] => [
	...config.deer.map((confidence, i) => ({ id: i, species: 'deer' as Species, confidence })),
	...config.frog.map((confidence, i) => ({ id: TOTAL_DEER + i, species: 'frog' as Species, confidence })),
];

// Purely cosmetic vertical scatter so icons at similar confidence don't sit
// exactly on top of each other. Deterministic in `id`, so it stays part of
// the fixed dataset -- not Math.random().
const jitterFor = (id: number): number => ((id * 47) % 23) - 11;

interface IRocPoint {
	fpr: number;
	tpr: number;
}

/*
	Standard ROC-curve construction -- the same thing sklearn.metrics.roc_curve
	computes, already shown earlier on this page: sweep the threshold down
	from above the highest score to below the lowest, tracking cumulative
	true/false positives as each animal's score is crossed.
*/
const computeRocPoints = (animals: IAnimal[]): IRocPoint[] => {
	const sorted = [...animals].sort((a, b) => b.confidence - a.confidence);
	const points: IRocPoint[] = [{ fpr: 0, tpr: 0 }];

	let tp = 0;
	let fp = 0;
	let i = 0;
	while (i < sorted.length) {
		const score = sorted[i].confidence;
		while (i < sorted.length && sorted[i].confidence === score) {
			if (sorted[i].species === 'deer') tp += 1;
			else fp += 1;
			i += 1;
		}
		points.push({ fpr: fp / TOTAL_FROG, tpr: tp / TOTAL_DEER });
	}
	return points;
};

// Trapezoidal area under the (already fpr-ascending) ROC points.
const computeAuc = (points: IRocPoint[]): number => {
	let auc = 0;
	for (let i = 1; i < points.length; i += 1) {
		const dx = points[i].fpr - points[i - 1].fpr;
		const avgY = (points[i].tpr + points[i - 1].tpr) / 2;
		auc += dx * avgY;
	}
	return auc;
};

interface IScopeData {
	config: IScopeConfig;
	animals: IAnimal[];
	rocPoints: IRocPoint[];
	auc: number;
}

// Computed once at module load for all three scopes -- not recomputed per
// render, and not magic literals: change the confidence arrays above and
// this follows automatically.
const SCOPE_DATA: Record<ScopeId, IScopeData> = SCOPES.reduce((acc, config) => {
	const animals = buildAnimals(config);
	const rocPoints = computeRocPoints(animals);
	acc[config.id] = { config, animals, rocPoints, auc: computeAuc(rocPoints) };
	return acc;
}, {} as Record<ScopeId, IScopeData>);

const pct = (n: number): string => `${Math.round(n * 100)}%`;

type Cell = 'tp' | 'fp' | 'fn' | 'tn';

const cellFor = (animal: IAnimal, threshold: number): Cell => {
	const shot = animal.confidence >= threshold;
	if (animal.species === 'deer') return shot ? 'tp' : 'fn';
	return shot ? 'fp' : 'tn';
};

const xScale = (confidence: number): number => 20 + (confidence / 100) * 360;
const rocX = (fpr: number): number => 20 + fpr * 170;
const rocY = (tpr: number): number => 180 - tpr * 170;

export const HunterConfidenceWidget: React.FC = () => {
	const [scopeId, setScopeId] = useState<ScopeId>('basic');
	const [threshold, setThreshold] = useState(50);

	const { config, animals, auc } = SCOPE_DATA[scopeId];

	const { tp, fp, fn, tn } = useMemo(() => {
		let TP = 0;
		let FP = 0;
		let FN = 0;
		let TN = 0;
		for (const animal of animals) {
			const cell = cellFor(animal, threshold);
			if (cell === 'tp') TP += 1;
			else if (cell === 'fp') FP += 1;
			else if (cell === 'fn') FN += 1;
			else TN += 1;
		}
		return { tp: TP, fp: FP, fn: FN, tn: TN };
	}, [animals, threshold]);

	const accuracy = (tp + tn) / (TOTAL_DEER + TOTAL_FROG);
	const precision = tp + fp > 0 ? tp / (tp + fp) : null;
	const recall = tp / TOTAL_DEER;
	const specificity = tn / TOTAL_FROG;
	const f1 = precision !== null && precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : null;

	const shotCount = tp + fp;
	const currentFpr = fp / TOTAL_FROG;
	const currentTpr = recall;
	const thresholdX = xScale(threshold);

	return (
		<div className='hunter-widget'>
			<fieldset className='hunter-widget-scope'>
				<legend>Equipment</legend>
				<div className='hunter-widget-scope-options'>
					{SCOPES.map((s) => (
						<label
							key={s.id}
							className={`hunter-widget-scope-option${s.id === scopeId ? ' active' : ''}`}
						>
							<input
								type='radio'
								name='hunter-scope'
								value={s.id}
								checked={s.id === scopeId}
								onChange={() => setScopeId(s.id)}
							/>
							<span className='hunter-widget-scope-option-label'>{s.label}</span>
							<span className='hunter-widget-scope-option-blurb'>{s.blurb}</span>
						</label>
					))}
				</div>
			</fieldset>
			<p className='hunter-widget-note hunter-widget-scope-explainer'>
				Same 25 animals, same true species, every time &mdash; switching equipment doesn&rsquo;t change who&rsquo;s out
				there, it changes how well you can tell them apart from a distance. That&rsquo;s a different question from where
				you set the threshold below.
			</p>

			<div className='hunter-widget-strip-wrap'>
				<svg viewBox='0 0 400 130' className='hunter-widget-strip' role='img' aria-hidden='true'>
					<line x1={20} y1={65} x2={380} y2={65} className='hunter-axis' />
					<line x1={thresholdX} y1={5} x2={thresholdX} y2={125} className='hunter-threshold-line' />
					{animals.map((animal) => {
						const cell = cellFor(animal, threshold);
						const y = 65 + jitterFor(animal.id);
						return (
							<g
								key={animal.id}
								className={`hunter-animal hunter-animal-${cell}`}
								transform={`translate(${xScale(animal.confidence)}, ${y})`}
							>
								<circle r={11} className='hunter-animal-ring' />
								<text textAnchor='middle' dominantBaseline='central' fontSize={16}>
									{animal.species === 'deer' ? '🦌' : '🐸'}
								</text>
							</g>
						);
					})}
					{[0, 25, 50, 75, 100].map((tick) => (
						<text key={tick} x={xScale(tick)} y={122} textAnchor='middle' className='hunter-tick-label'>
							{tick}
						</text>
					))}
				</svg>
				<div className='hunter-widget-axis-caption'>Model&rsquo;s confidence this is a deer &rarr;</div>
			</div>

			<div className='hunter-widget-slider-row'>
				<label htmlFor='hunter-threshold-slider' className='hunter-widget-slider-label'>
					Shoot anything at or above:
				</label>
				<input
					id='hunter-threshold-slider'
					type='range'
					min={0}
					max={100}
					value={threshold}
					onChange={(e) => setThreshold(Number(e.target.value))}
					aria-valuetext={`${threshold}% confidence with the ${config.label} -- ${shotCount} shot: ${tp} deer, ${fp} frogs`}
					className='hunter-widget-slider'
				/>
				<span className='hunter-widget-slider-value'>{threshold}%</span>
			</div>
			<div className='hunter-widget-anchors'>
				<span>&larr; 0%: trigger-happy, shoot everything</span>
				<span>100%: only sure shots &rarr;</span>
			</div>

			<p className='hunter-widget-caption'>
				With the <strong>{config.label.toLowerCase()}</strong> at <strong>{threshold}%</strong> confidence, you shoot{' '}
				<strong>{shotCount}</strong> animal{shotCount === 1 ? '' : 's'}: <strong>{tp}</strong> deer and{' '}
				<strong>{fp}</strong> frog{fp === 1 ? '' : 's'}.
			</p>

			<table className='table table-sm table-bordered hunter-widget-metrics'>
				<thead>
					<tr>
						<th>Metric</th>
						<th>Formula</th>
						<th>This threshold</th>
						<th>In plain terms</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Accuracy</td>
						<td>(TP+TN)/25</td>
						<td>({tp}+{tn})/25 = {pct(accuracy)}</td>
						<td className='hunter-widget-plain'>Overall, how often was the call right?</td>
					</tr>
					<tr>
						<td>Precision</td>
						<td>TP/(TP+FP)</td>
						<td>
							{precision === null
								? `${tp}/(${tp}+${fp}) = undefined (no shots taken)`
								: `${tp}/(${tp}+${fp}) = ${pct(precision)}`}
						</td>
						<td className='hunter-widget-plain'>When you pulled the trigger, how often was it really a deer?</td>
					</tr>
					<tr>
						<td>Recall</td>
						<td>TP/(TP+FN)</td>
						<td>{tp}/({tp}+{fn}) = {pct(recall)}</td>
						<td className='hunter-widget-plain'>Of all the deer actually out there, how many did you get?</td>
					</tr>
					<tr>
						<td>True positive rate</td>
						<td>TP/(TP+FN)</td>
						<td>{tp}/({tp}+{fn}) = {pct(currentTpr)}</td>
						<td className='hunter-widget-plain'>
							Same number as Recall above &mdash; it&rsquo;s the height of your dot on the ROC curve below.
						</td>
					</tr>
					<tr>
						<td>False positive rate</td>
						<td>FP/(FP+TN)</td>
						<td>{fp}/({fp}+{tn}) = {pct(currentFpr)}</td>
						<td className='hunter-widget-plain'>
							The flip side of Specificity &mdash; it&rsquo;s how far right your dot sits on the ROC curve below.
						</td>
					</tr>
					<tr>
						<td>Specificity</td>
						<td>TN/(TN+FP)</td>
						<td>{tn}/({tn}+{fp}) = {pct(specificity)}</td>
						<td className='hunter-widget-plain'>Of all the frogs actually out there, how many did you correctly leave alone?</td>
					</tr>
					<tr>
						<td>F1</td>
						<td>2&middot;P&middot;R/(P+R)</td>
						<td>{f1 === null ? 'undefined (no shots taken)' : pct(f1)}</td>
						<td className='hunter-widget-plain'>One score that punishes you if either precision or recall is bad.</td>
					</tr>
				</tbody>
			</table>

			<div className='hunter-widget-roc-wrap'>
				<svg
					viewBox='0 0 200 200'
					className='hunter-widget-roc'
					role='img'
					aria-label={`ROC curves for all three equipment options; the ${config.label} is currently selected, area under curve ${auc.toFixed(2)}`}
				>
					<line x1={20} y1={180} x2={20} y2={10} className='hunter-axis' />
					<line x1={20} y1={180} x2={190} y2={180} className='hunter-axis' />
					<line x1={20} y1={180} x2={190} y2={10} className='hunter-roc-diagonal' />
					{SCOPES.map((s) => (
						<polyline
							key={s.id}
							className={`hunter-roc-curve${s.id === scopeId ? ' active' : ' inactive'}`}
							fill='none'
							points={SCOPE_DATA[s.id].rocPoints.map((p) => `${rocX(p.fpr)},${rocY(p.tpr)}`).join(' ')}
						/>
					))}
					<circle cx={rocX(currentFpr)} cy={rocY(currentTpr)} r={5} className='hunter-roc-point' />
					<text x={10} y={95} textAnchor='middle' transform='rotate(-90, 10, 95)' className='hunter-axis-label'>
						True positive rate
					</text>
					<text x={105} y={196} textAnchor='middle' className='hunter-axis-label'>
						False positive rate
					</text>
				</svg>
				<ul className='hunter-widget-auc-legend'>
					{SCOPES.map((s) => (
						<li key={s.id} className={s.id === scopeId ? 'active' : undefined}>
							{s.label}: AUC = <strong>{SCOPE_DATA[s.id].auc.toFixed(2)}</strong>
						</li>
					))}
				</ul>
			</div>

			<p className='hunter-widget-note'>
				The 25 animals, their species, and each scope&rsquo;s
				confidence scores are the same for everyone &mdash; only the threshold and equipment you pick change.
			</p>
		</div>
	);
};

export default HunterConfidenceWidget;
