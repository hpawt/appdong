<script>
	import { resolve } from '$app/paths';
	export let data;
</script>

<div class="page-container">
	<header class="page-header">
		<h1>공지사항</h1>
		<p>공지사항을 주기적으로 확인해 주세요.</p>
	</header>

	{#if data.announcements && data.announcements.length > 0}
		<div class="announcement-list">
			{#each data.announcements as item (item.id)}
				<a href={resolve('/announce/[id]', { id: item.id })} class="list-item">
					<div class="item-meta">
						<span>{item.authorName}</span>
						<span>·</span>
						<span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
					</div>
					<h3 class="item-title">{item.title}</h3>
					<div class="read-more">
						<span>자세히 보기 &rarr;</span>
					</div>
				</a>
			{/each}
		</div>
	{:else if data.unavailable}<p role="alert">
			공지사항을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
		</p>{:else}<div class="empty-state">
			<p>아직 등록된 공지사항이 없습니다.</p>
		</div>{/if}
</div>

<style>
	.page-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 4rem 2rem 6rem;
	}
	.page-header {
		text-align: center;
		margin-bottom: 5rem;
	}
	h1 {
		font-family: var(--font-serif);
		font-size: 4rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: -1px;
	}
	p {
		color: var(--secondary-color);
		font-size: 1.1rem;
	}

	.announcement-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.list-item {
		display: block;
		background-color: #252830;
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		text-decoration: none;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			border-color 0.2s ease;
	}
	.list-item:hover {
		transform: translateY(-5px);
		box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
		border-color: var(--primary-color);
	}

	.item-meta {
		font-size: 0.9rem;
		color: var(--secondary-color);
		margin-bottom: 0.5rem;
	}
	.item-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-color);
		margin: 0;
		line-height: 1.4;
	}

	.read-more {
		margin-top: 1.5rem;
		font-weight: 500;
		color: var(--secondary-color);
		opacity: 0;
		transition: opacity 0.2s;
	}
	.list-item:hover .read-more {
		opacity: 1;
	}

	.empty-state {
		text-align: center;
		padding: 4rem;
		border: 1px dashed var(--border-color);
		border-radius: 12px;
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
	}
</style>
