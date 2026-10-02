<!-- src/routes/+page.svelte -->
<script>
	import { resolve } from '$app/paths';
	// 홈페이지를 구성하는 각 섹션 컴포넌트들을 불러옵니다.
	import Hero from './components/Hero.svelte';
	import Introduction from './components/Introduction.svelte';
	export let data; // load 함수로부터 데이터를 받습니다.
</script>

<!-- 각 섹션 컴포넌트들을 순서대로 배치합니다. -->

{#if data.user && data.user.role === 'ADMIN'}
	<a href={resolve('/admin')} class="admin-fab" title="관리자 페이지로 이동">
		<!-- 설정 아이콘 SVG -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="12" cy="12" r="3"></circle><path
				d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
			></path></svg
		>
		<span>관리자 페이지</span>
	</a>
{/if}

<Hero />

<section class="announcements-section-v2">
	<h2 class="section-title">공지사항</h2>
	<div class="card-list">
		{#if data.recentAnnouncements && data.recentAnnouncements.length > 0}
			{#each data.recentAnnouncements as item (item.id)}
				<a href={resolve('/announce/[id]', { id: item.id })} class="announcement-card">
					<div class="card-content">
						<h4 class="card-title">{item.title}</h4>
						<p class="card-meta">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</p>
					</div>
					<div class="card-arrow">
						<span>&rarr;</span>
					</div>
				</a>
			{/each}
		{:else if data.announcementsUnavailable}<p role="alert">
				공지사항을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
			</p>{:else}<div class="empty-state">
				<p>등록된 공지사항이 없습니다.</p>
			</div>{/if}
	</div>
	<div class="more-link-container">
		<a href={resolve('/announce')} class="more-link">모든 공지사항 보기</a>
	</div>
</section>
<Introduction />

<style>
	/* 기존에 있던 .announcements-section 관련 스타일은 모두 지워도 됩니다. */

	.announcements-section-v2 {
		padding: 6rem 0;
		border-top: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
	}

	.section-title {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		text-align: center;
		margin-top: 0;
		margin-bottom: 3rem;
	}

	.card-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.announcement-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.75rem 2rem;
		background-color: #252830;
		border: 1px solid var(--border-color);
		border-radius: 12px;
		text-decoration: none;
		transition:
			transform 0.2s ease-in-out,
			border-color 0.2s ease-in-out,
			box-shadow 0.2s ease-in-out;
	}

	.announcement-card:hover {
		transform: translateY(-5px);
		border-color: var(--primary-color);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.card-title {
		font-size: 1.2rem;
		font-weight: 500;
		color: var(--text-color);
		margin: 0;
	}

	.card-meta {
		font-size: 0.9rem;
		color: var(--secondary-color);
		margin: 0;
	}

	.card-arrow {
		font-size: 1.5rem;
		color: var(--secondary-color);
		opacity: 0; /* 평소에는 숨김 */
		transform: translateX(-10px); /* 왼쪽으로 살짝 이동 */
		transition:
			opacity 0.2s ease-in-out,
			transform 0.2s ease-in-out;
	}

	.announcement-card:hover .card-arrow {
		opacity: 1; /* 마우스를 올리면 나타남 */
		transform: translateX(0); /* 제자리로 이동 */
	}

	.more-link-container {
		text-align: center;
		margin-top: 3rem;
	}

	.more-link {
		color: var(--primary-color);
		font-weight: 500;
		text-decoration: none;
		border: 1px solid var(--border-color);
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.more-link:hover {
		background-color: var(--primary-color);
		border-color: var(--primary-color);
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		border: 1px dashed var(--border-color);
		border-radius: 12px;
		color: var(--secondary-color);
	}

	.more-link {
		display: block;
		text-align: right;
		margin-top: 1rem;
	}
	.admin-fab {
		position: fixed; /* 화면에 고정 */
		bottom: 2rem;
		right: 2rem;

		display: inline-flex;
		align-items: center;
		gap: 0.75rem;

		background-color: var(--primary-color);
		color: white;

		padding: 0.8rem 1.5rem;
		border-radius: 999px; /* 알약 모양 */

		font-weight: bold;
		text-decoration: none;

		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		z-index: 50; /* 다른 콘텐츠 위에 있도록 */

		transition:
			transform 0.2s ease-in-out,
			box-shadow 0.2s ease-in-out;
		animation: fadeIn 0.5s ease-out;
	}

	.admin-fab:hover {
		transform: translateY(-4px) scale(1.05);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 모바일에서는 텍스트를 숨겨 아이콘만 보이게 할 수 있습니다. */
	@media (max-width: 600px) {
		.admin-fab {
			padding: 0.9rem; /* 정사각형에 가깝게 */
			border-radius: 50%; /* 원 모양 */
		}
		.admin-fab span {
			display: none; /* 텍스트 숨김 */
		}
	}
</style>
