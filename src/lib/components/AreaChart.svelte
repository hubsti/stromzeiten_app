<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';

	export let labels;
	export let ceidata;

	console.log(ceidata);
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
						data: ceidata,
						borderWidth: 2,
						fill: true
					}
				]
			},
			options: {
				scales: {
					x: {
						type: 'time',
						time: {
							parser: 'MM/DD/YYYY HH:mm',
							tooltipFormat: 'll HH:mm',
							unit: 'hour',
							displayFormats: {
								hour: 'MM/DD/YYYY'
							}
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
