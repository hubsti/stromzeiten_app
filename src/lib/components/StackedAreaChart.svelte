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

	let colorMapping: { [key: string]: string } = {
		lignite: 'rgb(156, 98, 75)', // Dark Red for lignite
		gas: 'rgb(195, 83, 110)', // Tomato for gas
		coal: 'rgb(183, 158, 88)', // Dim Gray for coal
		oil: 'rgb(153, 146, 127)', // Saddle Brown for oil
		other: 'rgb(112, 128, 144)', // Slate Gray for other non-renewables
		waste: 'rgb(160, 82, 45)', // Sienna for waste
		biomass: 'rgb(63, 130, 115)', // Dark Olive Green for biomass (renewable)
		geothermal: 'rgb(34, 139, 34)', // Forest Green for geothermal (renewable)
		hydro: 'rgb(77, 137, 188)', // Steel Blue for hydro (renewable)
		other_renew: 'rgb(46, 139, 87)', // Sea Green for other renewable
		solar: 'rgb(239, 138, 50)', // Gold for solar (renewable)
		wind: 'rgb(138, 210, 194)', // Light Sky Blue for wind (renewable)
		nuclear: 'rgb(185, 193, 46)' // Orange for nuclear
	};


	let datasets = Object.keys(gendata).map((key) => ({
		label: key,
		data: gendata[key],
		borderWidth: 2,
		backgroundColor: colorMapping[key],
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
						stacked: true
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

<div class="card w-full bg-base-100 shadow h-96 xl:h-full">
	<div class="card-body">
		<h2 class="card-title">Hourly electricity production</h2>
		<div
			class="canvas-container mt-8"
			style="position: relative;   
			height: 100%;
  			width: 100%; "
		>
			<canvas bind:this={ctx}  in:fade></canvas>
		</div>
	</div>
</div>

<style>
html[data-theme='dark'] .canvas-container canvas {
    filter: invert(1) hue-rotate(180deg);
}

</style>
