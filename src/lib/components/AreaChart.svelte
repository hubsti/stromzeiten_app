<script lang="ts">
	import { draw, fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
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
	let width, height, gradient;

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
		value: averagecei,
	};

		const annotation2 = {
		type: 'line',
		borderColor: 'black',
		borderDash: [6, 6],
		borderDashOffset: 0,
		borderWidth: 1,
		label: {
			display: true,
			content: 'Live: ',
			position: 'end'
		},
		scaleID: 'x',
		value: labels[-1],
	};

	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;

	function getGradient(ctx, chartArea) {
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
	$: if (ctx) {
		if (chart) {
			chart.destroy();
		}

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
							return getGradient(ctx, chartArea);
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
							tooltipFormat: 'DD MM HH:mm',
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
