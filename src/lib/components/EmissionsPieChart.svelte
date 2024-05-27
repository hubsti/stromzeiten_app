<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';
	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;

	export let labels;
	export let generationdata;

	let colorMapping = {
		lignite: 'rgb(128, 0, 0)', // Dark Red for lignite
		gas: 'rgb(255, 99, 71)', // Tomato for gas
		coal: 'rgb(105, 105, 105)', // Dim Gray for coal
		oil: 'rgb(139, 69, 19)', // Saddle Brown for oil
		other: 'rgb(112, 128, 144)', // Slate Gray for other non-renewables
		waste: 'rgb(160, 82, 45)', // Sienna for waste
		biomass: 'rgb(85, 107, 47)', // Dark Olive Green for biomass (renewable)
		geothermal: 'rgb(34, 139, 34)', // Forest Green for geothermal (renewable)
		hydro: 'rgb(70, 130, 180)', // Steel Blue for hydro (renewable)
		other_renew: 'rgb(46, 139, 87)', // Sea Green for other renewable
		solar: 'rgb(255, 215, 0)', // Gold for solar (renewable)
		wind: 'rgb(135, 206, 250)', // Light Sky Blue for wind (renewable)
		nuclear: 'rgb(255, 165, 0)' // Orange for nuclear
	};
	$: if (ctx) {
		if (chart) {
			chart.destroy();
		}
		// @ts-ignore
		chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Electricity production',
						data: generationdata,
						backgroundColor: labels.map(
							(label: string | number) => colorMapping[label as keyof typeof colorMapping]
						),
						hoverOffset: 4
					}
				]
			},
			options: {
				animation: false,
				plugins: {
					legend: {
						position: 'left'
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								var label = context.label || '';

								if (label) {
									label += ': ';
								}

								if (context.parsed !== null) {
									label += context.parsed + ' gCO₂eq/kWh';
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

<div class="card w-96 bg-base-100 shadow">
	<div class="card-body">
		<h2 class="card-title">Emissions output by source</h2>
		<div class="canvas-container">
			<canvas bind:this={ctx} width="500" height="500" in:fade></canvas>
		</div>
	</div>
</div>
