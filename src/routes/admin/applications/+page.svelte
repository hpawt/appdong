<!-- src/routes/admin/applications/+page.svelte -->
<script>
	import { resolve } from '$app/paths';
	export let data;
</script>

<div class="page-container">
	<header class="page-header">
		<h1>지원서 조회</h1>
		<p>총 {data.applications.length}개의 지원서가 제출되었습니다.</p>
	</header>

	{#if data.applications.length > 0}
		<div class="application-list">
			{#each data.applications as app (app.id)}
				<a href={resolve('/admin/applications/[id]', { id: app.id })} class="application-card">
					<div class="card-main">
						<span class="applicant-name">{app.fullName}</span>
						<span class="applicant-id">({app.studentId})</span>
					</div>
					<div class="card-sub">
						<span class="department">{app.department}</span>
						<span class="submitted-at"
							>{new Date(app.submittedAt).toLocaleDateString('ko-KR')} 제출</span
						>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>아직 제출된 지원서가 없습니다.</p>
		</div>
	{/if}
</div>

<style>
	.page-header {
		margin-bottom: 2.5rem;
	}
	h1 {
		font-family: var(--font-serif);
		font-size: 2.2rem;
		margin: 0 0 0.5rem;
	}
	p {
		color: var(--secondary-color);
	}
	.application-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	.application-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		background-color: #2c2f38;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		text-decoration: none;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.application-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--primary-color);
	}
	.applicant-name {
		font-size: 1.2rem;
		font-weight: 500;
		color: var(--text-color);
	}
	.applicant-id {
		color: var(--secondary-color);
		margin-left: 0.5rem;
	}
	.card-sub {
		text-align: right;
		font-size: 0.9rem;
		color: var(--secondary-color);
	}
	.department {
		display: block;
	}
	.empty-state {
		text-align: center;
		padding: 4rem;
		background-color: #2c2f38;
		border: 1px dashed var(--border-color);
		border-radius: 8px;
	}
</style>
