<!-- src/routes/+layout.svelte -->
<script>
	import { asset } from '$app/paths';
	import { page } from '$app/stores';
	import { pageMetadata } from '$lib/seo';
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import './styles.css';
	export let data;
	$: metadata = pageMetadata($page.url.pathname, $page.data);
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<link rel="icon" type="image/png" href={asset('/optimized/favicon.png')} />
	<link rel="canonical" href={metadata.canonical} />
	<meta name="description" content={metadata.description} />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:url" content={metadata.canonical} />
	<meta property="og:image" content="https://www.appdong.com/apdomk.png" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	{#if metadata.noindex}<meta name="robots" content="noindex, nofollow" />{/if}
</svelte:head>

<a class="skip-link" href="#main-content">본문으로 바로가기</a>
<div class="app-container">
	<Header user={data.user} />
	<main id="main-content" tabindex="-1">
		<slot />
	</main>
	<Footer />
</div>

<style>
	.skip-link {
		position: fixed;
		top: -100px;
		left: 1rem;
		z-index: 2000;
		background: var(--bg-color);
		padding: 1rem;
		border: 2px solid var(--primary-color);
	}
	.skip-link:focus {
		top: 1rem;
	}
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	@media (max-width: 768px) {
		main {
			padding: 1.5rem;
		}
	}
	@media (max-width: 480px) {
		main {
			padding: 1rem;
		}
	}
</style>
