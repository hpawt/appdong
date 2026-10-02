<!-- src/routes/admin/announcements/+page.svelte -->
<script>
	import { resolve } from '$app/paths';
	export let data;
</script>

<div class="page-container">
	<header class="page-header">
		<h1>공지사항 관리</h1>
		<a href={resolve('/admin/announcements/new')} class="create-button">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"
				></line></svg
			>
			<span>새 공지사항 작성</span>
		</a>
	</header>

	<p>총 {data.announcements.length}개의 공지사항이 있습니다.</p>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>제목</th>
					<th>작성자</th>
					<th>작성일</th>
					<th>관리</th>
				</tr>
			</thead>
			<tbody>
				{#if data.announcements.length > 0}
					{#each data.announcements as item (item.id)}
						<tr>
							<td
								><a
									href={resolve('/announce/[id]', { id: item.id })}
									target="_blank"
									title="공개 페이지에서 보기">{item.title}</a
								></td
							>
							<td>{item.authorName}</td>
							<td>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</td>
							<td>
								<a
									href={resolve('/admin/announcements/[id]/edit', { id: item.id })}
									class="action-link">수정 / 삭제</a
								>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="4" class="empty-row">작성된 공지사항이 없습니다.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.page-container {
		width: 100%;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	h1 {
		font-family: var(--font-serif);
		font-size: 2.2rem;
		margin: 0;
	}
	p {
		color: var(--secondary-color);
	}
	.create-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background-color: var(--primary-color);
		color: white;
		padding: 0.7rem 1.3rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		transition: filter 0.2s;
	}
	.create-button:hover {
		filter: brightness(1.1);
	}
	.table-wrapper {
		width: 100%;
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		margin-top: 2rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid var(--border-color);
		white-space: nowrap;
	}
	tr:last-child td {
		border-bottom: none;
	}
	th {
		background-color: #2c2f38;
		font-weight: 500;
		color: var(--secondary-color);
	}
	a {
		color: var(--text-color);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
	.action-link {
		color: var(--primary-color);
		font-weight: 500;
	}
	.empty-row {
		text-align: center;
		padding: 3rem;
		color: var(--secondary-color);
	}
</style>
