<script>
	// 푸터에 표시할 동아리 정보를 객체로 관리하면 나중에 수정하기 편합니다.
	const clubInfo = {
		name: 'APPDONG',
		madeby: 'APPDONG 유준호',
		copyrightYear: new Date().getFullYear(),
		address: '대구광역시 북구 대학로 80, 경북대학교 백호관 610호',
		email: '@knu.appdong',
		president: { name: '송호민', phone: 'Hominsong@knu.ac.kr' },
		vicePresidents: [{ name: '강수영', phone: '' }],
		social: {
			instagram: 'https://www.instagram.com/knu.appdong',
			github: 'https://github.com/APPDONG-KNU',
			discord: 'https://appdong.com/egg'
		}
	};
</script>

<footer class="footer-container">
	<div class="footer-content">
		<!-- 상단 섹션: Copyright 및 소셜 아이콘 -->
		<div class="footer-top">
			<p class="copyright">
				Copyright © {clubInfo.copyrightYear}
				{clubInfo.name} All Rights Reserved.
			</p>
			<div class="social-links">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- This is an external URL validated before rendering. -->
				<a
					href={new URL(clubInfo.social.instagram).href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Instagram"
				>
					<img src="/igimg.svg" alt="Instagram" />
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -- This is an external URL validated before rendering. -->
				<a
					href={new URL(clubInfo.social.github).href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
				>
					<img src="/ghimg.svg" alt="GitHub" />
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -- This is an external URL validated before rendering. -->
				<a
					href={new URL(clubInfo.social.discord).href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Discord"
				>
					<img src="/dcimg.svg" alt="Discord" />
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		</div>

		<hr class="divider" />

		<!-- 하단 섹션: 상세 정보 -->
		<div class="footer-bottom">
			<!-- 왼쪽 정보 (동아리 정보) -->
			<div class="info-left">
				<p class="made-by">Made by <strong>{clubInfo.madeby}</strong></p>
				<div class="details">
					<p>{clubInfo.address}</p>
					<p><a href="mailto:{clubInfo.email}">{clubInfo.email}</a></p>
				</div>
			</div>

			<!-- 오른쪽 정보 (임원 연락처) -->
			<div class="info-right">
				<div class="contact-group">
					<p class="role"><strong>회장</strong></p>
					<p>{clubInfo.president.name} {clubInfo.president.phone}</p>
				</div>
				<div class="contact-group">
					<p class="role"><strong>부 회장</strong></p>
					{#each clubInfo.vicePresidents as vice (vice.name)}
						<p>{vice.name} {vice.phone}</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</footer>

<style>
	/* 1. 푸터 전체 컨테이너 스타일 */
	/* 1. footer 태그 자체는 화면에 꽉 차도록 아무런 여백과 너비 제한이 없습니다. */
	.footer-container {
		background-color: #16181d;
		color: var(--secondary-color);
		margin-top: 5rem;
		font-size: 0.9rem;
	}

	/* 2. 내부에 있는 .footer-content div가 최대 너비, 중앙 정렬, 상하좌우 여백을 모두 담당합니다. */
	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	/* ... (이하 나머지 모든 기존 스타일은 그대로 유지) ... */

	/* 2. 상단 섹션 스타일 */
	.footer-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.copyright {
		margin: 0;
	}
	.social-links {
		display: flex;
		gap: 1.5rem;
	}
	.social-links img {
		width: 24px;
		height: 24px;
		opacity: 0.7;
		transition: opacity 0.2s;
	}
	.social-links a:hover img {
		opacity: 1;
	}

	/* 3. 구분선 스타일 */
	.divider {
		border: none;
		height: 1px;
		background-color: var(--border-color);
		margin-bottom: 2rem;
	}

	/* 4. 하단 섹션 스타일 */
	.footer-bottom {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}
	.info-left {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.made-by strong {
		color: var(--text-color);
	}
	.details p {
		margin: 0.25rem 0;
		line-height: 1.6;
	}
	.details a {
		color: var(--secondary-color);
		text-decoration: none;
		transition: color 0.2s;
	}
	.details a:hover {
		color: var(--primary-color);
	}

	.info-right {
		display: flex;
		gap: 3rem;
		text-align: right;
	}
	.contact-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.role strong {
		color: var(--text-color);
	}

	@media (max-width: 768px) {
		.footer-bottom {
			flex-direction: column;
			align-items: flex-start;
			text-align: left;
			gap: 2.5rem;
		}
		.info-right {
			flex-direction: column;
			text-align: left;
			gap: 2rem;
		}
	}
	@media (max-width: 500px) {
		.footer-top {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}
	}
</style>
