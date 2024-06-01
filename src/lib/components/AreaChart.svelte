<script lang="ts">
	import { bluePeriodsStore, threedayavg } from '$lib/store';
	import { fade } from 'svelte/transition';
	import Chart, { type ChartArea } from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { DateTime } from 'luxon';
	import annotationPlugin from 'chartjs-plugin-annotation';

	Chart.register(annotationPlugin);
	export let labels;
	export let ceidata;
	export let ceiPrediction;


	export const CHART_COLORS = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};
	let width: number,
		height: number,
		gradient: { addColorStop: (arg0: number, arg1: string) => void };

	const annotation2 = {
		type: 'line',
		borderColor: 'black',
		borderDash: [6, 6],
		borderDashOffset: 0,
		borderWidth: 1,
		label: {
			display: true,
			content: 'Live: ' + ceidata[ceidata.length - 1].toFixed(2),
			position: 'end'
		},
		scaleID: 'x',
		value: labels[ceidata.length - 1]
	};

	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;

	function getGradient(ctx: CanvasRenderingContext2D, chartArea: ChartArea) {
		const chartWidth = chartArea.right - chartArea.left;
		const chartHeight = chartArea.bottom - chartArea.top;
		if (!gradient || width !== chartWidth || height !== chartHeight) {
			// Create the gradient because this is either the first render
			// or the size of the chart has changed
			width = chartWidth;
			height = chartHeight;
			gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
			gradient.addColorStop(0, CHART_COLORS.blue);
			gradient.addColorStop(0.5, CHART_COLORS.yellow);
			gradient.addColorStop(1, CHART_COLORS.red);
		}

		return gradient;
	}

	function getColorStopForIndex(index: number, totalPoints: number): string {
		const stop = index / (totalPoints - 1);
		if (stop <= 0.5) {
			return CHART_COLORS.blue;
		} else if (stop > 0.5 && stop < 1) {
			return CHART_COLORS.yellow;
		} else {
			return CHART_COLORS.red;
		}
	}
	function calculateAverage(data: number[]): number {
		const validData = data.filter((value) => !isNaN(value));
		const sum = validData.reduce((acc, value) => acc + value, 0);
		return validData.length ? sum / validData.length : 0;
	}

	const averageCEI = calculateAverage(ceidata);
	const averageCEIPrediction = calculateAverage(ceiPrediction);
	const BLUE_THRESHOLD = ((averageCEI + averageCEIPrediction) / 2) * 0.9; //
	threedayavg.set(BLUE_THRESHOLD);
	const annotation = {
		type: 'line',
		borderColor: 'black',
		borderDash: [6, 6],
		borderDashOffset: 0,
		borderWidth: 1,
		label: {
			display: true,
			drawTime: 'afterDatasetsDraw',
			content: '3 day average: ' + BLUE_THRESHOLD.toFixed(2),
			position: 'end'
		},
		scaleID: 'y',
		value: BLUE_THRESHOLD
	};
	function findBluePeriods(data: any[], labels: string | any[]) {
		let periods = [];
		let start: any = null;
		let today = DateTime.local().startOf('day');

		data.forEach((value, index) => {
			if (value <= BLUE_THRESHOLD) {
				if (start === null) {
					start = labels[index];
				}
			} else {
				if (start !== null) {
					let startTime = DateTime.fromISO(new Date(start).toISOString());
					let endTime = DateTime.fromISO(new Date(labels[index - 1]).toISOString());
					let duration = endTime.diff(startTime, 'hours').hours;
					if (
						start !== labels[index - 1] &&
						duration <= 24 &&
						duration !== 1 &&
						startTime >= today
					) {
						periods.push({ start, end: labels[index - 1] });
						start = null;
						let periodsToday = periods.filter((period) =>
							DateTime.fromISO(period.start).hasSame(today, 'day')
						);
						if (periodsToday.length >= 3) {
							// Discard the last period
							periods.pop();
						}
					}
				}
			}
		});

		// Handle case where the last value is also below the threshold
		if (start !== null) {
			let startTime = DateTime.fromISO(start);
			let endTime = DateTime.fromISO(labels[labels.length - 1]);
			let duration = endTime.diff(startTime, 'hours').hours;
			if (start !== labels[labels.length - 1] && duration <= 24) {
				periods.push({ start, end: labels[labels.length - 1] });
			}
		}

		return periods;
	}
	$: if (ctx) {
		if (chart) {
			chart.destroy();
		}

		const bluePeriods = findBluePeriods(ceidata, labels).concat(
			findBluePeriods(ceiPrediction, labels)
		);
		// @ts-ignore
		bluePeriodsStore.set(bluePeriods);

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Live',
						data: ceidata,
						borderWidth: 2,
						fill: true,
						borderColor: function (context) {
							const chart = context.chart;
							const { ctx, chartArea } = chart;

							if (!chartArea) {
								// This case happens on initial chart load
								return;
							}
							const gradient = getGradient(ctx, chartArea);
							const colorStop = getColorStopForIndex(
								context.dataIndex,
								context.dataset.data.length
							);

							return gradient;
						}
					},
					{
						label: 'Forecast',
						data: ceiPrediction,
						borderDash: [6, 6],
						borderWidth: 2,
						fill: true,
						borderColor: function (context) {
							const chart = context.chart;
							const { ctx, chartArea } = chart;

							if (!chartArea) {
								// This case happens on initial chart load
								return;
							}
							return getGradient(ctx, chartArea);
						}
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						type: 'time',
						time: {
							tooltipFormat: 'DD HH:mm',
							unit: 'hour',

							displayFormats: {
								hour: ' dd.MM HH:mm'
							}
						},
						ticks: {
							source: 'labels',
							stepSize: 12,
							maxRotation: 15
						}
					},
					y: {
						//beginAtZero: true
					}
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								var label = context.dataset.label || '';

								if (label) {
									label += ': ';
								}

								if (context.parsed !== null) {
									label += context.parsed.y.toFixed(2) + ' gCO₂eq/kWh';
								}

								return label;
							}
						}
					},
					annotation: {
						// @ts-ignore
						annotations: {
							annotation,
							annotation2
						}
					}
				}
			}
		});
	}
</script>

<div class="card w-full bg-base-100 shadow flex flex-col h-96 xl:h-full">
	<div class="card-body flex-grow">
		<h2 class="card-title">Carbon Intensity</h2>

		<div
			class="canvas-container"
			style="position: relative;   
			height: 100%;
  			width: 100%; "
		>
			<canvas bind:this={ctx} in:fade></canvas>
		</div>
	</div>
</div>

<style>
	html[data-theme='dark'] .canvas-container canvas {
		filter: invert(1) hue-rotate(180deg);
	}
</style>
