<script lang="ts">
	import { countryFlags } from '$lib/utils/countries';
	import { threedayavg } from '$lib/store';
	export let country;
	export let emissions: Promise<any>;
	export let energyPercentages: Promise<any>;
	export let energyDifferences: Promise<any>;

	let threedayavgstat: number;

	// Subscribe to the store to get the blue periods
	threedayavg.subscribe((value) => {
		threedayavgstat = Number(value);
	});

	const currentDate = new Date();
	const formattedDate = currentDate.toLocaleString('en-GB', {
		day: 'numeric',
		//weekday: 'long',
		//year: 'numeric',
		month: 'long'
	});
	const formattedTime = currentDate.toLocaleString('en-GB', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: false
	});
</script>

<div class="card bg-base-100 shadow">
	<div class="card-body">
		{#if countryFlags[country]}
			<h2 class="card-title">Carbon intensity in {country} {countryFlags[country]}</h2>
		{:else}
		Carbon intensity in 🌍
		{/if}
		<div class="stats stats-vertical xl:stats-horizontal">
			<div class="stat">
				<!-- <div class="stat-title">On 5th May 2023 at 14:00</div> -->
				
				{#await emissions}
				<div>loading data</div>
				{:then value}
				<div class="stat-title">On {formattedDate} at {value.time}</div>
				{:catch error}
				<h6>Error loading data</h6>
				{/await}
				
				<div class="flex flex-row">
					{#await emissions}
					<div>loading data</div>
					{:then value}
					
						<div class="stat-value">{value.Carbon_Intensity_CEI}</div>
					
						{:catch error}
							<h6>Error loading data</h6>
						{/await}

						{#await emissions}
							<div>loading data</div>
						{:then value}
							{#if value.Carbon_Intensity_CEI >= 1.2 * threedayavgstat}
								<div class="stat-value mx-6">Poor</div>
								<div class="stat-figure text-error mt-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-8 h-8"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
										/>
									</svg>
								</div>
							{:else if value.Carbon_Intensity_CEI < 1.2 * threedayavgstat && value.Carbon_Intensity_CEI >= 0.8 * threedayavgstat}
								<div class="stat-value mx-6">Moderate</div>
								<div class="stat-figure text-warning mt-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-8 h-8"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.182 15h-6.364M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
										/>
									</svg>
								</div>
							{:else}
								<div class="stat-value mx-6">Good</div>
								<div class="stat-figure text-success mt-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-8 h-8"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
										/>
									</svg>
								</div>
							{/if}
						{:catch error}
							<h6>Error loading data</h6>
						{/await}
					</div>

					<div class="stat-desc">gCO₂eq/kWh</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<svg
						class="w-8 h-8"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"
						/>
					</svg>
				</div>
				<div class="stat-title">Fossil</div>
				{#await energyPercentages}
					<div>loading data</div>
				{:then value}
					<div class="flex flex-row">
						<div class="stat-value">{value.nonRenewableabs} MW</div>
						{#await energyDifferences}
							<div>loading data</div>
						{:then value}
							<div class="badge badge badge-outline ml-3 mt-2">
								{#if Math.round(value.nonRenewable) !== 0}
									{value.nonRenewable >= 0 ? '↑' : '↓'} {Math.abs(value.nonRenewable).toFixed(0)}%
								{:else}0%
								{/if}
							</div>
						{:catch error}
							<h6>Error loading data</h6>
						{/await}
					</div>
				{:catch error}
					<h6>Error loading data</h6>
				{/await}
				{#await energyPercentages}
					<div>loading data</div>
				{:then value}
					<div class="stat-desc">{value.nonRenewable}% of available electricity</div>
				{:catch error}
					<h6>Error loading data</h6>
				{/await}
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<svg
						class="w-8 h-8"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
						/>
					</svg>
				</div>
				<div class="stat-title">Renewable</div>
				{#await energyPercentages}
					<div>loading data</div>
				{:then value}
					<div class="flex flex-row">
						<div class="stat-value">{value.renewableabs} MW</div>
						{#await energyDifferences}
							<div>loading data</div>
						{:then value}
							<div class="badge badge badge-outline ml-4 mt-2">
								{#if Math.round(value.renewable) !== 0}
									{value.renewable >= 0 ? '↑' : '↓'} {Math.abs(value.renewable).toFixed(0)}%
								{:else}
									0%
								{/if}
							</div>
						{:catch error}
							<h6>Error loading data</h6>
						{/await}
					</div>
				{:catch error}
					<h6>Error loading data</h6>
				{/await}
				{#await energyPercentages}
					<div>loading data</div>
				{:then value}
					<div class="stat-desc">{value.renewable}% of available electricity</div>
				{:catch error}
					<h6>Error loading data</h6>
				{/await}
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<svg
						class="w-8 h-8"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-width="2"
							d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
						/>
					</svg>
				</div>
				<div class="stat-title">Nuclear</div>
				{#await energyPercentages}
					<div>loading data</div>
				{:then value}
					<div class="flex flex-row">
						<div class="stat-value">{value.nuclearabs} MW</div>
						{#await energyDifferences}
							<div>loading data</div>
						{:then value}
							<div class="badge badge badge-outline ml-4 mt-2">
								{#if Math.round(value.nuclear) !== 0}
									{value.nuclear >= 0 ? '↑' : '↓'} {Math.abs(value.nuclear).toFixed(0)}%
								{:else}
									0%
								{/if}
							</div>
						{:catch error}
							<h6>Error loading data</h6>
						{/await}
					</div>
				{:catch error}
					<h6>Error loading data</h6>
				{/await}
				{#await energyPercentages}
					<div>loading data</div>
				{:then value}
					<div class="stat-desc">{value.nuclear}% of available electricity</div>
				{:catch error}
					<h6>Error loading data</h6>
				{/await}
			</div>
		</div>
	</div>
</div>
