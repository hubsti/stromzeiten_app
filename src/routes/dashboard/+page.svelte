<script lang="ts">
	import type { PageData } from './$types';
	import Stats from '$lib/components/Stats.svelte';
	import Table from '$lib/components/Table.svelte';
	import AreaChart from '$lib/components/AreaChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import EmissionsPieChart from '$lib/components/EmissionsPieChart.svelte';
	import StackedAreaChart from '$lib/components/StackedAreaChart.svelte';
	import {
		calculateEnergyPercentages,
		formatDataForAreaChart,
		formatDataForAreaChartGeneration,
		formatDataForPieChart,
	} from '$lib/utils/dataprocessor';

	export let data: PageData;

	$: generation24h = formatDataForAreaChartGeneration(data.streamed.generation_24h);
	$: energyPercentagesResponse = calculateEnergyPercentages(data.streamed.generation);
	$: emissionspiechartdata = formatDataForPieChart(data.streamed.emissionspiechart);
	$: piechartdata = formatDataForPieChart(data.streamed.generationchart);
	$: areachartdata = formatDataForAreaChart(
		data.streamed.carbon_intensity,
		data.streamed.forecast,
		data.streamed.averge_cei
	);
</script>

<div class="container h-full mx-auto max-w-fit bg-base-150">
	<div class="grid grid-cols-1 xl:grid-cols-7 gap-4">
		<div class="xl:col-span-7">
			<Stats
				country={data.country}
				emissions={data.streamed.dashboard}
				energyPercentages={energyPercentagesResponse}
				energyDifferences={data.streamed.generation_diff}
			/>
		</div>
		<div class="xl:col-span-2">
			<Table />
		</div>

		<div class="xl:col-span-5">
			{#await areachartdata}
				loading
			{:then value}
				<AreaChart
					labels={value.labels_sorted}
					ceidata={value.ceiValues}
					ceiPrediction={value.ceiPredictionValues}
				/>
			{:catch error}
				Error loading data
			{/await}
		</div>
		<div class="xl:col-span-2">
			{#await piechartdata}
				loading
			{:then value}
				<PieChart labels={value.labels} generationdata={value.valuesList} />
			{:catch error}
				Error loading data
			{/await}
		</div>

		<div class="xl:col-span-2">
			{#await emissionspiechartdata}
				loading
			{:then value}
				<EmissionsPieChart labels={value.labels} generationdata={value.valuesList} />
			{:catch error}
				Error loading data
			{/await}
		</div>
		<div class="xl:col-span-3">
			{#await generation24h}
				loading
			{:then value}
				<StackedAreaChart labels={value.labels} gendata={value.valuesObject} />
			{:catch error}
				Error loading data
			{/await}
		</div>
	</div>
</div>
