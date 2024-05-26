<script lang="ts">
	import { bluePeriodsStore } from '$lib/store';
	import { draw, fade } from 'svelte/transition';
	import Chart, { type ChartArea } from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { DateTime } from 'luxon';
	import annotationPlugin from 'chartjs-plugin-annotation';

	Chart.register(annotationPlugin);
	export let labels;
	export let ceidata;
	export let ceiPrediction;
	export let averagecei;

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

	const annotation = {
		type: 'line',
		borderColor: 'black',
		borderDash: [6, 6],
		borderDashOffset: 0,
		borderWidth: 1,
		label: {
			display: true,
			drawTime: 'afterDatasetsDraw',
			content: 'Average: ' + averagecei.toFixed(2),
			position: 'end'
		},
		scaleID: 'y',
		value: averagecei
	};

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
	const BLUE_THRESHOLD = (averageCEI + averageCEIPrediction) / 2; //
	//console.log('Average CEI:', averageCEI);
	//console.log('Average CEI Prediction:', averageCEIPrediction);
	//console.log('Blue threshold:', BLUE_THRESHOLD);
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
					let endTime =DateTime.fromISO(new Date(labels[index - 1]).toISOString());
					let duration = endTime.diff(startTime, 'hours').hours;
					console.log(`Start: ${start}, End: ${labels[index - 1]}, Duration: ${duration} hours`);
					if (start !== labels[index - 1] && duration <= 24 && startTime >= today)  {
						periods.push({ start, end: labels[index - 1] });
						start = null;
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
		//console.log('Blue periods:', bluePeriods);
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Live',
						data: ceidata,
						borderWidth: 2,
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
							//console.log(`Color for data point ${context.dataIndex}: ${colorStop}`);
							return gradient;
						}
					},
					{
						label: 'Forecast',
						data: ceiPrediction,
						borderDash: [6, 6],
						borderWidth: 2,
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

<div class="card w-full h-full bg-base-100 shadow">
	<div class="card-body">
		<h2 class="card-title">Carbon Intensity</h2>
		<div class="canvas-container">
			<canvas bind:this={ctx} width="100" height="50" in:fade></canvas>
		</div>
	</div>
</div>
