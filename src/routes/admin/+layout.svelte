<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { siteFeatures } from '$lib/site-features';

	// 현재 URL 경로가 주어진 경로로 시작하는지 확인하여 active 상태를 결정합니다.
	/** @param {string} path */
	function isActive(path) {
		// 대시보드(/admin)의 경우, 다른 페이지와 겹치지 않도록 정확히 일치하는지 확인합니다.
		if (path === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(path);
	}
</script>

<div class="admin-page-wrapper">
	<!-- =================== 데스크탑용 사이드바 (PC에서만 보임) =================== -->
	<aside class="admin-sidebar">
		<a href={resolve('/admin')} class="sidebar-title-link">
			<h2>관리자 메뉴</h2>
		</a>
		<nav>
			{#if siteFeatures.modu}<a
					href={resolve('/admin/calendar')}
					class:active={isActive('/admin/calendar')}>일정 관리</a
				>
				<a href={resolve('/admin/forms')} class:active={isActive('/admin/forms')}>신청·설문 폼</a
				>{/if}
			<a href={resolve('/admin/users')} class:active={isActive('/admin/users')}>회원 관리</a>
			<a href={resolve('/admin/applications')} class:active={isActive('/admin/applications')}
				>지원서 조회</a
			>
			<a href={resolve('/admin/announcements')} class:active={isActive('/admin/announcements')}
				>공지사항 관리</a
			>
		</nav>
	</aside>

	<!-- =================== 메인 콘텐츠 영역 =================== -->
	<div class="admin-main-content">
		<!-- =================== 모바일용 상단 탭 (모바일에서만 보임) =================== -->
		<nav class="admin-mobile-nav">
			{#if siteFeatures.modu}<a
					href={resolve('/admin/calendar')}
					class:active={isActive('/admin/calendar')}>일정</a
				>
				<a href={resolve('/admin/forms')} class:active={isActive('/admin/forms')}>폼 관리</a>{/if}
			<a href={resolve('/admin')} class:active={isActive('/admin')}>대시보드</a>
			<a href={resolve('/admin/users')} class:active={isActive('/admin/users')}>회원 관리</a>
			<a href={resolve('/admin/applications')} class:active={isActive('/admin/applications')}
				>지원서 조회</a
			>
			<a href={resolve('/admin/announcements')} class:active={isActive('/admin/announcements')}
				>공지사항</a
			>
		</nav>

		<main class="admin-slot-content">
			<slot />
		</main>
	</div>
</div>

<style>
	/* ==========================================================================
	   1. 데스크탑 기본 스타일 (Desktop First)
	   ========================================================================== */
	.admin-page-wrapper {
		display: flex;
		/* (핵심) 전체 컨테이너에 넉넉한 여백을 주고, 카드 사이에 간격을 만듭니다. */
		padding: 1.5rem;
		gap: 1.5rem;
		min-height: calc(100vh - (/* 헤더 높이 추정치 */ 70px));
	}

	/* (핵심) 사이드바를 둥근 모서리를 가진 카드로 만듭니다. */
	.admin-sidebar {
		width: 240px;
		padding: 2rem;
		background-color: #252830; /* 살짝 밝은 배경색 */
		border: 1px solid var(--border-color);
		border-radius: 16px; /* 둥근 모서리 적용 */
		flex-shrink: 0;
	}
	.sidebar-title-link {
		display: block;
		text-decoration: none;
		margin-bottom: 2.5rem;
		text-align: center;
		transition: transform 0.2s ease;
	}
	.sidebar-title-link:hover {
		transform: scale(1.05);
	}
	.admin-sidebar h2 {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		margin: 0;
		color: var(--text-color);
	}
	.admin-sidebar nav {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.admin-sidebar nav a {
		color: var(--secondary-color);
		text-decoration: none;
		text-align: center;
		padding: 0.8rem 1.2rem;
		border-radius: 8px;
		transition:
			background-color 0.2s,
			color 0.2s;
		font-weight: 500;
	}
	.admin-sidebar nav a:hover:not(.active) {
		background-color: #3a3f4b;
		color: var(--text-color);
	}
	.admin-sidebar nav a.active {
		background-color: var(--primary-color);
		color: white;
	}

	/* (핵심) 메인 콘텐츠 영역도 둥근 모서리를 가진 카드로 만듭니다. */
	.admin-main-content {
		flex: 1;
		background-color: #252830;
		padding: 2.5rem;
		border-radius: 16px; /* 둥근 모서리 적용 */
		border: 1px solid var(--border-color);
		overflow-x: auto;
	}

	/* 모바일 탭은 평소에 숨겨둡니다. */
	.admin-mobile-nav {
		display: none;
	}

	/* ==========================================================================
	   2. 모바일 반응형 스타일 (@media 쿼리)
	   ========================================================================== */
	@media (max-width: 768px) {
		.admin-page-wrapper {
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;
		}

		.admin-sidebar {
			display: none;
		}

		.admin-main-content {
			width: 100%;
			padding: 1.5rem; /* 모바일에서는 내부 여백을 줄임 */
		}

		.admin-mobile-nav {
			display: flex;
			border-bottom: 1px solid var(--border-color);
			background-color: #1f2128;
		}
		.admin-mobile-nav a {
			flex: 1;
			padding: 1rem 0.5rem;
			text-align: center;
			font-size: 0.9rem;
			color: var(--secondary-color);
			text-decoration: none;
			border-bottom: 3px solid transparent;
			transition:
				color 0.2s,
				border-color 0.2s;
			white-space: nowrap;
		}
		.admin-mobile-nav a.active {
			color: var(--text-color);
			border-bottom-color: var(--primary-color);
		}
	}
</style>
