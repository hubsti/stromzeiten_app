<script lang="ts">
	import { bluePeriodsStore } from '$lib/store';
	import { DateTime } from 'luxon';
	import { onDestroy } from 'svelte';

	interface BluePeriod {
		start: string;
		end: string;
	}

	let bluePeriods: BluePeriod[] = [];
	let unsubscribe: () => void;

	unsubscribe = bluePeriodsStore.subscribe((value) => {
		bluePeriods = value;
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	function getDayOfWeek(dateStr: string) {
		const isoStr = new Date(dateStr).toISOString();
		return DateTime.fromISO(isoStr).toFormat('cccc')+", "+ DateTime.fromISO(isoStr).toFormat('d')+ " "+ DateTime.fromISO(isoStr).toFormat('LLLL');
	}


	$: periodsByDay = bluePeriods.reduce((acc: Record<string, BluePeriod[]>, period) => {
		const day = getDayOfWeek(period.start);
		if (!acc[day]) acc[day] = [];
		acc[day].push(period);
		return acc;
	}, {});
</script>

<div class="card w-96 bg-base-100 shadow h-max ">
	<div class="card-body">
		<h2 class="card-title">
			Forecast 🔌
		</h2>
		<div class="flex flex-row">
			<div class="stat-title">Next slots to plug in</div>
		</div>
		<div class="stats stats-vertical h-96 mb-11 ">
			{#each Object.keys(periodsByDay) as day}
				<div class="stat">
					<div class="stat-title m-2">{day}</div>
					{#each periodsByDay[day] as period}
						<div class="stat-value m-2">
							{DateTime.fromISO(new Date(period.start).toISOString()).toFormat('HH:mm')} - {DateTime.fromISO(
								new Date(period.end).toISOString()
							).toFormat('HH:mm')}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>
