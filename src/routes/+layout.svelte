<!-- src/routes/+layout.svelte -->
<script>
	import { asset } from '$app/paths';
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import './styles.css';
	export let data;
</script>

<svelte:head>
	<!-- 1. 모든 페이지의 기본 타이틀을 설정합니다. -->
	<title>AppDong Club Page</title>

	<!-- 2. 파비콘(Favicon)을 설정합니다. -->
	<link rel="icon" href={asset('/apdomk.png')} />

	<!-- 3. (선택사항) SEO 및 공유를 위한 메타 태그 -->
	<meta name="description" content="APPDONG 동아리 공식 웹사이트입니다." />
	<!-- OG Image: 미리보기 카드에 표시될 대표 이미지 -->
	<!-- 이미지 경로는 static 폴더에 있는 파일을 직접 가리킵니다. (절대 경로 사용) -->
	<meta property="og:title" content="AppDong Club Page" />

	<!-- OG Description: 미리보기 카드에 표시될 설명 -->
	<meta property="og:description" content="열정있는 당신, 그리고 누구나" />
	<meta property="og:image" content="https://www.appdong.com/apdomk.png" />

	<!-- OG URL: 공유될 페이지의 표준 URL (실제 사이트 주소로 변경) -->
	<meta property="og:url" content="https://www.appdong.com/" />

	<!-- OG Type: 웹사이트 종류 (보통 'website') -->
	<meta property="og:type" content="website" />
</svelte:head>

<div class="app-container">
	<Header user={data.user} />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
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
