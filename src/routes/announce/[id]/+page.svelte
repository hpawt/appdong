<script>
	import { resolve } from '$app/paths';
	import 'quill/dist/quill.snow.css';
	export let data;
	$: announcement = data.announcement;
</script>

<div class="page-container">
	{#if announcement}
		<article class="post">
			<header class="post-header">
				<a href={resolve('/announce')} class="back-link">&larr; 공지사항 목록으로</a>
				<h1>{announcement.title}</h1>
				<p class="meta">
					<span>By <strong>{announcement.authorName}</strong></span>
					<span>&nbsp;·&nbsp;</span>
					<span>{new Date(announcement.createdAt).toLocaleString('ko-KR')}</span>
				</p>
			</header>

			<div class="content ql-snow">
				<div class="ql-editor">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- Server load sanitizes both stored and new HTML with an allowlist. -->
					{@html announcement.content}
				</div>
			</div>
			{#if announcement.attachments.length}
				<section aria-label="첨부파일">
					<h2>첨부파일</h2>
					<ul>
						{#each announcement.attachments as file (file.url)}
							<li>
								<!-- eslint-disable svelte/no-navigation-without-resolve -- This is an external URL validated before rendering. -->
								<a href={new URL(file.url).href} target="_blank" rel="noopener noreferrer"
									>{file.name}</a
								>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</article>
	{:else}
		<div class="error-view">
			<h2>오류</h2>
			<p>해당 공지사항을 찾을 수 없거나 불러오는 데 실패했습니다.</p>
		</div>
	{/if}
</div>

<style>
	.page-container {
		max-width: 720px;
		margin: 4rem auto;
		padding: 2rem;
	}

	.post-header {
		text-align: left;
		margin-bottom: 4rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 2rem;
	}

	.back-link {
		display: block;
		margin-bottom: 2.5rem;
		color: var(--secondary-color);
		text-decoration: none;
		font-weight: 500;
	}

	.post-header h1 {
		font-family: var(--font-serif);
		font-size: 3.5rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -1.5px;
		color: var(--text-color);
		margin: 1rem 0;
	}

	.post-header .meta {
		color: var(--secondary-color);
		font-size: 1rem;
	}

	.meta strong {
		color: var(--text-color);
		font-weight: 500;
	}

	/* ==========================================================================
	   (핵심 수정) Quill 콘텐츠 스타일
	   ========================================================================== */
	:global(.content .ql-editor) {
		padding: 0;
		font-size: 1.15rem;
		line-height: 2;
		color: #d1d5db;
	}
	/* Sanitized content omits editor-only UI spans; render list markers on the item. */
	:global(.content .ql-editor li[data-list]::before) {
		display: inline-block;
		margin-left: -1.5em;
		margin-right: 0.3em;
		text-align: right;
		white-space: nowrap;
		width: 1.2em;
	}
	:global(.content .ql-editor li[data-list] > .ql-ui::before) {
		content: none;
	}
	:global(.content .ql-editor li[data-list='bullet']::before) {
		content: '\2022';
	}
	:global(.content .ql-editor li[data-list='checked']::before) {
		content: '\2611';
	}
	:global(.content .ql-editor li[data-list='unchecked']::before) {
		content: '\2610';
	}
	:global(.content .ql-editor li[data-list='ordered']::before) {
		content: counter(list-0, decimal) '. ';
	}

	:global(.content .ql-editor li[data-list='ordered'].ql-indent-1::before) {
		content: counter(list-1, lower-alpha) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-2::before) {
		content: counter(list-2, lower-roman) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-3::before) {
		content: counter(list-3, decimal) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-4::before) {
		content: counter(list-4, lower-alpha) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-5::before) {
		content: counter(list-5, lower-roman) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-6::before) {
		content: counter(list-6, decimal) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-7::before) {
		content: counter(list-7, lower-alpha) '. ';
	}
	:global(.content .ql-editor li[data-list='ordered'].ql-indent-8::before) {
		content: counter(list-8, lower-roman) '. ';
	}

	/* 👇 (수정) 이 규칙은 오직 '아래 여백'만 담당하도록 합니다. 밑줄(border)은 절대 넣지 않습니다. */
	:global(.content .ql-editor > *) {
		margin-bottom: 1.75rem !important;
	}

	/* 👇 (수정) 오직 h1, h2, h3 태그에만 밑줄(border-bottom)을 명확하게 적용합니다. */
	:global(.content .ql-editor h1),
	:global(.content .ql-editor h2),
	:global(.content .ql-editor h3) {
		font-family: var(--font-serif);
		font-weight: 700;
		line-height: 1.4;
		color: var(--text-color);
		border-bottom: 1px solid var(--border-color); /* 밑줄 스타일 */
		padding-bottom: 0.5rem;
		margin-top: 4rem;
		margin-bottom: 1.5rem !important;
	}
	:global(.content .ql-editor h1) {
		font-size: 2.2rem;
	}
	:global(.content .ql-editor h2) {
		font-size: 1.8rem;
	}
	:global(.content .ql-editor h3) {
		font-size: 1.5rem;
	}

	:global(.content .ql-editor a) {
		color: var(--primary-color);
		text-decoration: none;
		border-bottom: 2px solid rgba(255, 62, 0, 0.4);
		transition: all 0.2s;
	}
	:global(.content .ql-editor a:hover) {
		background-color: rgba(255, 62, 0, 0.1);
		border-bottom-color: var(--primary-color);
	}

	:global(.content .ql-editor strong) {
		color: var(--text-color);
		font-weight: 600;
	}

	.error-view {
		text-align: center;
		padding: 4rem 0;
	}

	@media (max-width: 768px) {
		.page-container {
			margin: 2rem auto;
			padding: 1.5rem;
		}
		.post-header h1 {
			font-size: 2.5rem;
			letter-spacing: -1px;
		}
	}
</style>
