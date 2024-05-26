<script lang="ts">
import { bluePeriodsStore } from "$lib/store";
import { DateTime } from 'luxon';

let bluePeriods: any[] = [];

// Subscribe to the store to get the blue periods
bluePeriodsStore.subscribe(value => {
  bluePeriods = value;
  console.log(bluePeriods);
});



function getDayOfWeek(dateStr: string) {
	console.log(dateStr);
	const isoStr = new Date(dateStr).toISOString();
	let debug = DateTime.fromISO(isoStr).toFormat('cccc');
	console.log(debug);	
  return debug;
}

// Helper function to get the day of the week

// Group periods by day of the week
$: periodsByDay = bluePeriods.reduce((acc, period) => {
  const day = getDayOfWeek(period.start);
  if (!acc[day]) acc[day] = [];
  acc[day].push(period);
  console.log(acc);
  return acc;
}, {});
</script>

<div class="card w-96 bg-base-100 shadow h-full">
  <div class="card-body">
    <h2 class="card-title">Forecast</h2>
	<div class = "flex flex-row">
	<div class="stat-title">Next slots to plug in 
	</div>🔌:</div>
    <div class="stats stats-vertical">
      {#each Object.keys(periodsByDay) as day}
        <div class="stat">
          <div class="stat-title m-2">{day}</div>
          {#each periodsByDay[day] as period}
            <div class="stat-value m-2">{DateTime.fromISO(new Date(period.start).toISOString()).toFormat('HH:mm')} - {DateTime.fromISO(new Date(period.end).toISOString()).toFormat('HH:mm')}</div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>