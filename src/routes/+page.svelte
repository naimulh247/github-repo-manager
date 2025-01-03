<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let repos = [];
	let selectedRepos = new Set();
	let loading = false;
	let error = '';
	let success = '';
	let userData = null;
	let filters = {
		public: true,
		private: true,
		forked: true,
		source: true
	};

	onMount(async () => {
		const response = await fetch('/api/auth/status');
		const data = await response.json();
		if (data.authenticated) {
			userData = data.user;
			await fetchRepos();
		}
	});

	function getFilteredRepos() {
		// @ts-ignore
		return repos.filter((repo) => {
			// Check visibility (public/private)
			const visibilityMatch =
				(filters.public && !repo.private) || (filters.private && repo.private);

			// Check fork status
			const forkStatusMatch = (filters.forked && repo.fork) || (filters.source && !repo.fork);

			// Show repo if it matches both visibility AND fork status filters
			return visibilityMatch && forkStatusMatch;
		});
	}

	// Add a computed count for better filter labels
	$: visibilityFilters = {
		// @ts-ignore
		public: repos.filter((r) => !r.private),
		// @ts-ignore
		private: repos.filter((r) => r.private),
		// @ts-ignore
		forked: repos.filter((r) => r.fork),
		// @ts-ignore
		source: repos.filter((r) => !r.fork)
	};

	async function handleLogin() {
		window.location.href = '/api/auth/github';
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		userData = null;
		repos = [];
		goto('/');
	}

	async function fetchRepos() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/github/repos');
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to fetch repositories');
			}
			const data = await response.json();
			repos = data;
		} catch (err) {
			// @ts-ignore
			error = 'Error fetching repositories: ' + err.message;
			console.error('Fetch error:', err);
		} finally {
			loading = false;
		}
	}

	// @ts-ignore
	function toggleRepoSelection(repoId) {
		if (selectedRepos.has(repoId)) {
			selectedRepos.delete(repoId);
		} else {
			selectedRepos.add(repoId);
		}
		selectedRepos = selectedRepos; // Trigger reactivity
	}

	// @ts-ignore
	async function handleBatchAction(action) {
		if (selectedRepos.size === 0) {
			error = 'Please select at least one repository';
			return;
		}

		loading = true;
		error = '';
		success = '';

		try {
			const response = await fetch('/api/github/batch-action', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action,
					repos: Array.from(selectedRepos)
				})
			});

			if (!response.ok) throw new Error(`Failed to ${action} repositories`);

			const result = await response.json();
			if (result.failures.length > 0) {
				error = `Failed to ${action}: ${result.failures.join(', ')}`;
			}
			if (result.successes.length > 0) {
				success = `Successfully ${action}d: ${result.successes.join(', ')}`;
				await fetchRepos();
			}
		} catch (err) {
			// @ts-ignore
			error = err.message;
		} finally {
			loading = false;
			selectedRepos = new Set();
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<div class="rounded-lg bg-white shadow-lg">
		<div class="border-b p-6">
			<div class="flex items-center justify-between">
				<h1 class="flex items-center gap-2 text-2xl font-bold">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-github"
						><path
							d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
						/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
					>
					GitHub Repository Manager
				</h1>
				{#if userData}
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2">
							<img src={userData.avatar_url} alt={userData.login} class="h-8 w-8 rounded-full" />
							<span>{userData.login}</span>
						</div>
						<button on:click={handleLogout} class="text-gray-600 hover:text-gray-800">
							Logout
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="p-6">
			{#if !userData}
				<div class="py-8 text-center">
					<button
						on:click={handleLogin}
						class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"
							/>
						</svg>
						Sign in with GitHub
					</button>
				</div>
			{:else}
				<div class="space-y-4">
					{#if error}
						<div class="rounded-lg bg-red-50 p-4 text-red-800">
							{error}
						</div>
					{/if}

					{#if success}
						<div class="rounded-lg bg-green-50 p-4 text-green-800">
							{success}
						</div>
					{/if}

					<div class="mb-4 space-y-4">
						<div class="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.25"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-info text-blue-600"
								><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg
							>
							<span class="text-sm text-blue-700"
								>Select filters from each category to view repositories</span
							>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<div class="group relative">
								<div class="rounded-lg border bg-white p-3">
									<div class="mb-3 text-sm font-medium text-gray-700">Visibility Filters</div>
									<div class="space-y-2">
										<div class="flex items-center space-x-2">
											<input
												type="checkbox"
												id="filter-public"
												bind:checked={filters.public}
												class="rounded border-gray-300"
											/>
											<label for="filter-public" class="cursor-pointer text-gray-600">
												Public ({visibilityFilters.public.length})
											</label>
										</div>
										<div class="flex items-center space-x-2">
											<input
												type="checkbox"
												id="filter-private"
												bind:checked={filters.private}
												class="rounded border-gray-300"
											/>
											<label for="filter-private" class="cursor-pointer text-gray-600">
												Private ({visibilityFilters.private.length})
											</label>
										</div>
									</div>
								</div>
								<div
									class="invisible absolute left-0 top-full z-10 mt-2 w-64 rounded-lg bg-gray-800 p-2 text-sm text-white shadow-lg group-hover:visible"
								>
									Filter repositories by their visibility status (public or private)
								</div>
							</div>

							<div class="group relative">
								<div class="rounded-lg border bg-white p-3">
									<div class="mb-3 text-sm font-medium text-gray-700">Repository Type</div>
									<div class="space-y-2">
										<div class="flex items-center space-x-2">
											<input
												type="checkbox"
												id="filter-source"
												bind:checked={filters.source}
												class="rounded border-gray-300"
											/>
											<label for="filter-source" class="cursor-pointer text-gray-600">
												Source ({visibilityFilters.source.length})
											</label>
										</div>
										<div class="flex items-center space-x-2">
											<input
												type="checkbox"
												id="filter-forked"
												bind:checked={filters.forked}
												class="rounded border-gray-300"
											/>
											<label for="filter-forked" class="cursor-pointer text-gray-600">
												Forked ({visibilityFilters.forked.length})
											</label>
										</div>
									</div>
								</div>
								<div
									class="invisible absolute left-0 top-full z-10 mt-2 w-64 rounded-lg bg-gray-800 p-2 text-sm text-white shadow-lg group-hover:visible"
								>
									Filter repositories by their origin (source repositories or forks)
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-2 pb-2">
					<button
						on:click={() => handleBatchAction('private')}
						disabled={loading}
						class="flex items-center gap-2 rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-lock"
							><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
								d="M7 11V7a5 5 0 0 1 10 0v4"
							/></svg
						>
						Make Selected Private
					</button>
					<button
						on:click={() => handleBatchAction('delete')}
						disabled={loading}
						class="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-trash"
							><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
								d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
							/></svg
						>
						Delete Selected
					</button>
				</div>

				{#if loading}
					<div class="py-8 text-center">
						<div
							class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
						></div>
						<p class="mt-2 text-gray-600">Loading repositories...</p>
					</div>
				{:else if getFilteredRepos().length === 0}
					<div class="py-8 text-center text-gray-600">
						No repositories found matching current filters
					</div>
				{:else}
					<div class="divide-y rounded-lg border">
						{#each getFilteredRepos() as repo (repo.id)}
							<div class="flex items-center p-4 hover:bg-gray-50">
								<input
									type="checkbox"
									checked={selectedRepos.has(repo.id)}
									on:change={() => toggleRepoSelection(repo.id)}
									class="mr-4"
								/>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<span class="truncate font-medium">{repo.name}</span>
										{#if repo.language}
											<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
												{repo.language}
											</span>
										{/if}
									</div>
									<div class="mt-1 flex items-center gap-3 text-sm text-gray-500">
										<span class="flex items-center gap-1">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="lucide lucide-sparkles"
												><path
													d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
												/><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path
													d="M5 18H3"
												/></svg
											>
											{repo.stargazers_count}
										</span>
										<span class="flex items-center gap-1">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="lucide lucide-utensils-crossed"
												><path
													d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"
												/><path
													d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"
												/><path d="m2.1 21.8 6.4-6.3" /><path d="m19 5-7 7" /></svg
											>
											{repo.forks_count}
										</span>
										<span class={repo.private ? 'text-yellow-600' : 'text-green-600'}>
											{repo.private ? 'Private' : 'Public'}
										</span>
										{#if repo.fork}
											<span class="text-blue-600">Forked</span>
										{/if}
									</div>
									{#if repo.last_commit}
										<div class="mt-1 text-xs text-gray-500">
											Last commit: {new Date(repo.last_commit.date).toLocaleDateString()} - {repo.last_commit.message.split(
												'\n'
											)[0]}
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-2">
									<span class="text-xs text-gray-500">
										Updated {new Date(repo.updated_at).toLocaleDateString()}
									</span>
									<a
										href={repo.html_url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:underline"
									>
										View
									</a>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
