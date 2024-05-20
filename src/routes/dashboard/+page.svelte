<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import Chart from 'chart.js/auto';

	export let data: PageData;

	let ctx: HTMLCanvasElement | undefined;
	let ctx1: HTMLCanvasElement | undefined;
	let chart: Chart | undefined;
	let chart1: Chart | undefined;

	let showAge = true;
	let showWeight = true;
	let showHeight = true;
	let chartType: 'line' = 'line';

	let chartType1: 'pie' | 'bar' = 'pie';
	$: if (ctx) {
		if (chart) {
			chart.destroy();
		}

		chart = new Chart(ctx, {
			type: chartType,
			data: {
				labels: data.users.map((user) => `${user.firstName} ${user.lastName}`),
				datasets: [
					{
						label: "User's age",
						data: data.users.map(({ age }) => age),
						borderWidth: 2,
						hidden: !showAge,
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
	let xValues = ['Italy', 'France', 'Spain', 'USA', 'Argentina'];
	let yValues = [55, 49, 44, 24, 15];

	$: if (ctx1) {
		if (chart1) {
			chart1.destroy();
		}
		chart1 = new Chart(ctx1, {
			type: chartType1,
			data: {
				labels: xValues,
				datasets: [
					{
						label: 'My First Dataset',
						data: [300, 50, 100],
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

<div class="container h-full mx-auto max-w-fit bg-base-150">
	<div class="grid grid-cols-7 gap-4">
		<div class="col-span-7">
			<div class="card  bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">Carbon intensity in France 🇫🇷 </h2>
			<div class="stats">
				<div class="stat">
					<div class="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-8 h-8 stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path></svg
						>
					</div>
					<div class="stat-title">On 5th May 2023 at 14:00</div>
					<div class="flex flex-row">
						<div class="stat-value">289</div>
						<div class="stat-value mx-6	">Good</div>
					</div>

					<div class="stat-desc">gCO₂eq/kWh</div>
				</div>

				<div class="stat">
					<div class="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-8 h-8 stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							></path></svg
						>
					</div>
					<div class="stat-title">Fossil</div>
					<div class="stat-value">12%</div>
					<div class="stat-desc">↘︎ 2MW</div>
				</div>

				<div class="stat">
					<div class="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-8 h-8 stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
							></path></svg
						>
					</div>
					<div class="stat-title">Renewable</div>
					<div class="stat-value">34%</div>
					<div class="stat-desc">↗︎ 12MW</div>
				</div>

				<div class="stat">
					<div class="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-8 h-8 stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
							></path></svg
						>
					</div>
					<div class="stat-title">Nuclear</div>
					<div class="stat-value">60%</div>
					<div class="stat-desc">↘︎ 90MW (14%)</div>
				</div>
			</div>
				</div>
			</div>

		</div>
		<div class="col-span-3">
			<div class="card w-96 bg-base-100 shadow h-full">
				<div class="card-body">
					<h2 class="card-title">Forecast</h2>
					<div class="overflow-x-auto">
						<table class="table">
							<!-- head -->
							<thead>
								<tr>
									<th>Day</th>
									<th>Time Period</th>
								</tr>
							</thead>
							<tbody>
								<!-- row 1 -->
								<tr>
									<td>Monday</td>
									<td>12:00-15:45</td>
								</tr>
								<!-- row 2 -->
								<tr>
									<td>Tuesday</td>
									<td>12:00-15:45</td>
								</tr>
								<!-- row 3 -->
								<tr>
									<td>Wednesday</td>
									<td>12:00-15:45</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<div class="col-span-4">
			<div class="card w-full bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">Carbon Intensity</h2>
					<div class="canvas-container">
						{#key [showAge, showHeight, showWeight, chartType]}
							<canvas bind:this={ctx} width="100" height="50" in:fade></canvas>
						{/key}
					</div>
				</div>
			</div>
		</div>
		<div class="col-span-3 mb-32">
			<div class="card w-96 bg-base-100 shadow">
				<div class="card-body">
					<h2 class="card-title">Electricity production by source</h2>
					<div class="canvas-container">
						<canvas bind:this={ctx1} width="500" height="500" in:fade></canvas>
					</div>
				</div>
			</div>
		</div>
		<div class="col-span-4">06</div>
	</div>
</div>
