<script>
	import { asset } from '$app/paths';
	import { optimizedImages } from '$lib/image-assets';
	const leadership = [
		{
			name: '송호민',
			department: '전자공학부',
			role: '회장',
			imageUrl: '/homin1.png'
		},
		{
			name: '강수영',
			department: '약학과',
			role: '부회장',
			imageUrl: ''
		}
	];

	const members = [
		{
			name: '양현우',
			department: '전자공학부',
			role: '기획부장',
			imageUrl: ''
		},
		{
			name: '오진묵',
			department: '전자공학부 모바일공학전공',
			role: '교육부장',
			imageUrl: ''
		},
		{
			name: '최민정',
			department: '전자공학부',
			role: '홍보부장',
			imageUrl: ''
		},
		{
			name: '유준호',
			department: '전자공학부',
			role: '기술부장',
			imageUrl: '/junho.png'
		},
		{
			name: '이주환',
			department: '컴퓨터공학부',
			role: '교육부원',
			imageUrl: ''
		},
		{
			name: '이경언',
			department: '컴퓨터학부',
			role: '교육부원',
			imageUrl: '/gyeong.png'
		}
	];
</script>

<div class="page-container">
	<header class="page-header">
		<h1>주요 임원진</h1>
		<p>APPDONG을 이끌어가는 임원진을 소개합니다.</p>
	</header>

	<!-- 회장단 섹션 -->
	<section class="team-section">
		<h2 class="section-title">임원진</h2>
		<div class="members-grid leadership-grid">
			{#each leadership as member (member.name)}
				<div class="member-card">
					<div class="member-photo">
						{#if member.imageUrl}<picture>
								{#if optimizedImages[member.imageUrl]}<source
										srcset={asset(optimizedImages[member.imageUrl].src)}
										type="image/webp"
									/>{/if}
								<img
									src={member.imageUrl}
									alt="{member.name} 프로필 사진"
									loading="lazy"
									decoding="async"
									width={optimizedImages[member.imageUrl]?.width ?? 400}
									height={optimizedImages[member.imageUrl]?.height ?? 400}
								/>
							</picture>{:else}<span class="member-placeholder" aria-hidden="true"
								>{member.name.slice(0, 1)}</span
							>{/if}
					</div>
					<div class="member-info">
						<h3>{member.name}</h3>
						<p class="role">{member.role}</p>
						{#if member.department}<p class="department">{member.department}</p>{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- 부원 섹션 -->
	<section class="team-section">
		<h2 class="section-title">운영진</h2>
		<div class="members-grid">
			{#each members as member (member.name)}
				<div class="member-card">
					<div class="member-photo">
						{#if member.imageUrl}<picture>
								{#if optimizedImages[member.imageUrl]}<source
										srcset={asset(optimizedImages[member.imageUrl].src)}
										type="image/webp"
									/>{/if}
								<img
									src={member.imageUrl}
									alt="{member.name} 프로필 사진"
									loading="lazy"
									decoding="async"
									width={optimizedImages[member.imageUrl]?.width ?? 400}
									height={optimizedImages[member.imageUrl]?.height ?? 400}
								/>
							</picture>{:else}<span class="member-placeholder" aria-hidden="true"
								>{member.name.slice(0, 1)}</span
							>{/if}
					</div>
					<div class="member-info">
						<h3>{member.name}</h3>
						<p class="role">{member.role}</p>
						{#if member.department}<p class="department">{member.department}</p>{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.member-placeholder {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		border: 3px solid var(--border-color);
		border-radius: 50%;
		background: #343a48;
		color: var(--secondary-color);
		font-size: 2.5rem;
	}
	.member-photo picture {
		display: block;
		width: 100%;
		height: 100%;
	}
	.page-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 4rem 2rem;
	}
	.page-header {
		text-align: center;
		margin-bottom: 5rem;
	}
	.page-header h1 {
		font-family: var(--font-serif);
		font-size: 3.5rem;
		margin-bottom: 1rem;
	}
	.page-header p {
		font-size: 1.2rem;
		color: var(--secondary-color);
	}

	.team-section {
		margin-bottom: 5rem;
	}
	.section-title {
		font-family: var(--font-serif);
		font-size: 2.2rem;
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.members-grid {
		display: grid;
		/* 화면 크기에 맞춰 2개~4개의 카드가 자동으로 배치되는 반응형 그리드 */
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}
	/* 회장단 배치 */
	.leadership-grid {
		max-width: 600px;
		margin: 0 auto;
	}

	.member-card {
		background-color: #252830;
		border: 1px solid var(--border-color);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.member-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
	}

	.member-photo {
		width: 120px;
		height: 120px;
		margin: 0 auto 1.5rem;
	}
	.member-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover; /* 이미지가 찌그러지지 않도록 */
		border-radius: 50%; /* 원형 프로필 사진 */
		border: 3px solid var(--border-color);
	}

	.member-info h3 {
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--text-color);
		margin: 0 0 0.25rem;
	}
	.member-info .role {
		font-size: 1rem;
		color: var(--primary-color);
		font-weight: 500;
		margin: 0 0 0.5rem;
	}
	.member-info .department {
		font-size: 0.9rem;
		color: var(--secondary-color);
		margin: 0;
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2.8rem;
		}
		.leadership-grid {
			max-width: 100%;
		}
	}
</style>
