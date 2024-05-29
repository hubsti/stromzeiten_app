<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';
            import { onMount } from 'svelte';

	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;

	export let labels;
	export let generationdata;
	let colorMapping = {
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
						borderColor: 'transparent',
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
									label += context.parsed + 'MW';
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
		<h2 class="card-title">Electricity production by source</h2>
		<div class="canvas-container">
			<canvas bind:this={ctx} width="500" height="500" in:fade></canvas>
		</div>
	</div>
</div>

<style>


</style>
