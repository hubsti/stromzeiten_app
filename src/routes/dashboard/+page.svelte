<script lang="ts">
	import type { PageData } from './$types';
	import Chart from 'chart.js/auto';
	import Stats from '$lib/components/Stats.svelte';
	import Table from '$lib/components/Table.svelte';
	import AreaChart from '$lib/components/AreaChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import { calculateEnergyPercentages, formatDataForAreaChart, formatDataForPieChart } from '$lib/utils/dataprocessor';
	export let data: PageData;

	$: energyPercentagesResponse = calculateEnergyPercentages(data.streamed.generation);
	$: piechartdata = formatDataForPieChart(data.streamed.generation);
	$: areachartdata = formatDataForAreaChart(data.streamed.carbon_intensity);
</script>

<div class="container h-full mx-auto max-w-fit bg-base-150">
	<div class="grid grid-cols-7 gap-4">
		<div class="col-span-7">
			<Stats emissions={data.streamed.dashboard} energyPercentages={energyPercentagesResponse} />
		</div>
		<div class="col-span-3">
			<Table />
		</div>

		<div class="col-span-4">
		{#await areachartdata}
			loading
		{:then value}
			<AreaChart labels={value.labels} ceidata={value.carbonIntensityValues} />
		{:catch error}
			Error loading data
		{/await}


		</div>
		<div class="col-span-3 mb-32">
		{#await piechartdata}
			loading
		{:then value}
			<PieChart labels={value.labels} generationdata={value.valuesList} />
		{:catch error}
			Error loading data
		{/await}

		</div>

		<div class="col-span-4">06</div>
	</div>
</div>
