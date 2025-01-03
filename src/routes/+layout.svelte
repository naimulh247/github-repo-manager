<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
    <title>GitHub Repo Manager</title>
    <meta name="description" content="Manage your GitHub repositories efficiently" />
</svelte:head>

{@render children()}
