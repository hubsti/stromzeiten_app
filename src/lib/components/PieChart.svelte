<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';
	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;


	export let labels
	export let generationdata

	$: if (ctx) {
		if (chart) {
			chart.destroy();
		}
        // @ts-ignore
		chart = new Chart(ctx, {
			type: "pie",
			data: {
				labels: labels,
				datasets: [
					{
						label: 'My First Dataset',
						data: generationdata,
						backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
						hoverOffset: 4
					}
				]
			},
			options: {
				animation: false,
				scales: {
					y: {
						beginAtZero: true
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
