<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import annotationPlugin from 'chartjs-plugin-annotation';

	Chart.register(annotationPlugin);
	export let labels;
	export let gendata;

	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;

	let datasets = Object.keys(gendata).map((key) => ({
		label: key,
		data: gendata[key],
		borderWidth: 2,
        fill: true
	}));
	$: if (ctx) {
		if (chart) {
			chart.destroy();
		}

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: datasets
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
						stacked: true,
					}
				},
				plugins: {
					legend: {
						display: false
					},

					tooltip: {
						mode: 'index',
						callbacks: {
							label: function (context) {
								var label = context.dataset.label || '';

								if (label) {
									label += ': ';
								}

								if (context.parsed !== null) {
									label += context.parsed.y.toFixed(2) + ' MW';
								}

								return label;
							}
						}
					}
				}
			}
		});
	}
</script>

<div class="card w-full bg-base-100 shadow h-full">
	<div class="card-body">
		<h2 class="card-title">Hourly electricity production</h2>
		<div class="canvas-container mt-8">
			<canvas bind:this={ctx} width="100" height="50" in:fade></canvas>
		</div>
	</div>
</div>
