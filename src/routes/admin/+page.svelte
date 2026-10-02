<script>
	import { resolve } from '$app/paths';
	export let data;
	$: ({ stats, recentUsers, recentApps, recentAnns } = data);
</script>

<div class="dashboard">
	<h1 class="dashboard-title">관리자 대시보드</h1>

	<!-- 1. 핵심 지표 카드 (3단 그리드) -->
	<div class="stats-grid">
		<div class="stat-card">
			<h2 class="card-title">총 회원 수</h2>
			<p class="stat-number">{stats.totalUsers}</p>
			<a href={resolve('/admin/users')} class="card-link">회원 관리 바로가기 &rarr;</a>
		</div>
		<div class="stat-card">
			<h2 class="card-title">총 지원서 수</h2>
			<p class="stat-number">{stats.totalApps}</p>
			<a href={resolve('/admin/applications')} class="card-link">지원서 조회 바로가기 &rarr;</a>
		</div>
		<div class="stat-card">
			<h2 class="card-title">총 공지사항 수</h2>
			<p class="stat-number">{stats.totalAnns}</p>
			<a href={resolve('/admin/announcements')} class="card-link">공지사항 관리 바로가기 &rarr;</a>
		</div>
	</div>

	<!-- 2. 최근 활동 목록 (카드 디자인 통일) -->
	<div class="recent-activity-grid">
		<div class="activity-card">
			<h3 class="card-title">회원 목록</h3>
			{#if recentUsers.length > 0}
				<ul class="activity-list">
					{#each recentUsers as user (user.id)}
						<li>
							<a href={resolve('/admin/users/[userId]', { userId: user.id })}
								><strong>{user.name}</strong> ({user.username})</a
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty-text">가입한 회원이 없습니다.</p>
			{/if}
		</div>
		<div class="activity-card">
			<h3 class="card-title">최근 제출된 지원서</h3>
			{#if recentApps.length > 0}
				<ul class="activity-list">
					{#each recentApps as app (app.id)}
						<li>
							<a href={resolve('/admin/applications/[id]', { id: app.id })}
								><strong>{app.fullName}</strong> ({new Date(app.submittedAt).toLocaleDateString(
									'ko-KR'
								)})</a
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty-text">제출된 지원서가 없습니다.</p>
			{/if}
		</div>
		<div class="activity-card">
			<h3 class="card-title">최근 공지사항</h3>
			{#if recentAnns.length > 0}
				<ul class="activity-list">
					{#each recentAnns as ann (ann.id)}
						<li>
							<a href={resolve('/admin/announcements/[id]/edit', { id: ann.id })}
								><strong>{ann.title}</strong> ({new Date(ann.createdAt).toLocaleDateString(
									'ko-KR'
								)})</a
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty-text">작성된 공지사항이 없습니다.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.dashboard-title {
		font-family: var(--font-serif);
		font-size: 2.2rem;
		margin: 0 0 2.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	/* --- 공통 카드 스타일 --- */
	.stat-card,
	.activity-card {
		background-color: #2c2f38;
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
	}
	.card-title {
		margin-top: 0;
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--secondary-color);
	}

	/* --- 핵심 지표 카드 --- */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}
	.stat-number {
		font-size: 3.5rem;
		font-weight: 700;
		color: var(--text-color);
		margin: 1rem 0;
	}
	.card-link {
		color: var(--primary-color);
		text-decoration: none;
		font-weight: 500;
	}

	/* --- 최근 활동 카드 --- */
	.recent-activity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}
	.activity-list {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.activity-list a {
		display: block;
		text-decoration: none;
		color: var(--text-color);
		padding: 0.5rem;
		margin: -0.5rem;
		border-radius: 6px;
		transition: background-color 0.2s;
	}
	.activity-list a:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}
	.activity-list strong {
		font-weight: 500;
	}
	.empty-text {
		color: var(--secondary-color);
		margin-top: 1.5rem;
	}

	@media (max-width: 900px) {
		.recent-activity-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
