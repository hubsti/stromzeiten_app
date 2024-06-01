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

	$: generation24hData = formatDataForAreaChartGeneration(data.streamed.generation24hData);
	$: energyPercentages = calculateEnergyPercentages(data.streamed.generationData);
	$: emissionsPieChartData = formatDataForPieChart(data.streamed.emissionsPieChartData);
	$: generationPieChartData = formatDataForPieChart(data.streamed.generationChartData);
	$: areaChartData = formatDataForAreaChart(
		data.streamed.carbonIntensityData,
		data.streamed.forecastData,
		data.streamed.averageCeiData
	);
</script>

<div class="container h-full mx-auto max-w-fit bg-base-150">
	<div class="grid grid-cols-1 xl:grid-cols-7 gap-4">
		<div class="xl:col-span-7">
			<Stats
				country={data.selectedCountry}
				emissions={data.streamed.dashboardData}
				energyPercentages={energyPercentages}
				energyDifferences={data.streamed.generationDifferenceData}
			/>
		</div>
		<div class="xl:col-span-2">
			<Table />
		</div>

		<div class="xl:col-span-5">
			{#await areaChartData}
				<p>Loading...</p>
			{:then value}
				<AreaChart
					labels={value.sortedLabels}
					ceidata={value.carbonIntensityValues}
					ceiPrediction={value.predictedCarbonIntensityValues}
				/>
			{:catch error}
				<p>Error loading data</p>
			{/await}
		</div>
		<div class="xl:col-span-2">
			{#await generationPieChartData}
				<p>Loading...</p>
			{:then value}
				<PieChart labels={value.labels} generationdata={value.valuesList} />
			{:catch error}
				<p>Error loading data</p>
			{/await}
		</div>

		<div class="xl:col-span-2">
			{#await emissionsPieChartData}
				<p>Loading...</p>
			{:then value}
				<EmissionsPieChart labels={value.labels} generationdata={value.valuesList} />
			{:catch error}
				<p>Error loading data</p>
			{/await}
		</div>
		<div class="xl:col-span-3">
			{#await generation24hData}
				<p>Loading...</p>
			{:then value}
				<StackedAreaChart labels={value.labels} gendata={value.valuesBySource} />
			{:catch error}
				<p>Error loading data</p>
			{/await}
		</div>
	</div>
</div>
