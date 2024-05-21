<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';


	export let labels
	export let ceidata
	let ctx: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;

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
						label: "User's age",
						data: ceidata,
						borderWidth: 2,
						fill: true
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

<div class="card w-full h-full bg-base-100 shadow">
	<div class="card-body">
		<h2 class="card-title">Carbon Intensity</h2>
		<div class="canvas-container">
				<canvas bind:this={ctx} width="100" height="50" in:fade></canvas>
		</div>
	</div>
</div>
