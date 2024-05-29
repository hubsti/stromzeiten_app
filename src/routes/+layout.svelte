<script lang="ts">
	import 'tailwindcss/tailwind.css';
	import { countryFlags, european_countries } from '$lib/utils/countries';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	const submitUpdateCountry: SubmitFunction = ({ action }) => {
		const country = action.searchParams.get('country');
	};
	export let selectedOption: string;
	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';
	function setThemeCheckbox() {
    const checkbox = document.querySelector('.theme-controller') as HTMLInputElement;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    checkbox.checked = currentTheme === 'dark';
	}

	// NOTE: the element that is using one of the theme attributes must be in the DOM on mount
	onMount(() => {
		themeChange(false);
		setThemeCheckbox();
		// 👆 false parameter is required for svelte
	});
</script>

<div class="navbar w-full bg-base-100 shadow mb-5">
	<div class="flex-1 px-2 lg:flex-none">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="btn btn-ghost text-xl">Stromzeiten</a>
	</div>
	<div class="flex justify-end flex-1 px-2">
		<div class="flex items-stretch">
			<label class="swap swap-rotate mr-2">
				<!-- this hidden checkbox controls the state -->
				<input type="checkbox" class="theme-controller" data-toggle-theme="dark" />

				<!-- sun icon -->
				<svg
					class="swap-off fill-current w-5 h-5"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					><path
						d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
					/></svg
				>

				<!-- moon icon -->
				<svg
					class="swap-on fill-current w-5 h-5"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					><path
						d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
					/></svg
				>
			</label>
			<!-- svelte-ignore a11y-missing-attribute -->
			<a class="btn btn-ghost rounded-btn">
				<svg
					width="20"
					height="20"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-5 w-5 stroke-current md:hidden"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
				<span class="hidden font-normal md:inline">About</span>
			</a>
			<div title="Choose country" class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost rounded-btn">
					<svg
						width="20"
						height="20"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-5 w-5 stroke-current md:hidden"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
						></path></svg
					>
					<span class="hidden font-normal md:inline">Country</span>
				</div>

				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-t-none w-52 mt-4"
				>
					<form method="POST" use:enhance={submitUpdateCountry}>
						{#each european_countries as country (country[1])}
							<li>
								<button
									formaction={`/?/setCountry&country=${country[0]}`}
									name="country"
									value={country[0]}
									><span class="flex-auto text-left">{country[0]} {countryFlags[country[0]]}</span
									></button
								>
							</li>
						{/each}
					</form>
				</ul>
			</div>
		</div>
		<div title="Choose language" class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost rounded-btn">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-5 w-5 stroke-current md:hidden"
					><path
						fill-rule="evenodd"
						d="M11 5a.75.75 0 0 1 .688.452l3.25 7.5a.75.75 0 1 1-1.376.596L12.89 12H9.109l-.67 1.548a.75.75 0 1 1-1.377-.596l3.25-7.5A.75.75 0 0 1 11 5Zm-1.24 5.5h2.48L11 7.636 9.76 10.5ZM5 1a.75.75 0 0 1 .75.75v1.261a25.27 25.27 0 0 1 2.598.211.75.75 0 1 1-.2 1.487c-.22-.03-.44-.056-.662-.08A12.939 12.939 0 0 1 5.92 8.058c.237.304.488.595.752.873a.75.75 0 0 1-1.086 1.035A13.075 13.075 0 0 1 5 9.307a13.068 13.068 0 0 1-2.841 2.546.75.75 0 0 1-.827-1.252A11.566 11.566 0 0 0 4.08 8.057a12.991 12.991 0 0 1-.554-.938.75.75 0 1 1 1.323-.707c.049.09.099.181.15.271.388-.68.708-1.405.952-2.164a23.941 23.941 0 0 0-4.1.19.75.75 0 0 1-.2-1.487c.853-.114 1.72-.185 2.598-.211V1.75A.75.75 0 0 1 5 1Z"
						clip-rule="evenodd"
					></path></svg
				>
				<span class="hidden font-normal md:inline">Language</span>
			</div>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-t-none w-52 mt-4"
			>
				<li><a>Item 1</a></li>
				<li><a>Item 2</a></li>
			</ul>
		</div>
	</div>
</div>

<slot />
<footer
	class="footer footer-center p-5 bg-base-200 text-base-content rounded bottom-0 left-0 w-full"
>
	<aside>
		<p>Made in Brussels 🇧🇪🇪🇺 with ❤️</p>
	</aside>
</footer>
