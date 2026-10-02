<!-- src/routes/about-us/+page.svelte -->
<script>
	import { resolve } from '$app/paths';
	// 1. 페이지를 렌더링하는 데 필요한 모든 데이터를 여기에 정의합니다.
	const tracks = [
		{
			tag: 'NEW!!',
			title: 'Vibe 클래스',
			description:
				'프로그래밍 경험이 전혀 없는 분들을 위해 준비했습니다. AI를 활용해 웹/앱을 만드는 방법을 기초부터 배우는 프로그램입니다.',
			recommendations: [
				'컴퓨터를 전혀 알지 못하는 분',
				'코딩이 어렵게 느껴져 시작을 못 해보신 분',
				'즐겁게 코딩을 경험해보고 싶으신 분'
			]
		},
		{
			title: '스터디',
			description:
				'부원들끼리 조를 편성해 자율적으로 학습하는 프로그램입니다. 프로그래밍 개념을 탄탄하게 잡고 싶으신 분들을 위한 활동입니다.',
			recommendations: [
				'언어 경험이 없거나 부족하신 분',
				'CS지식을 배우고 싶으신 분',
				'혼자 꾸준히 학습하기 어려우신 분'
			]
		},
		{
			title: '부트캠프',
			description:
				'팀을 구성하여 새로운 언어를 배우고 간단한 프로젝트를 완성해보는 프로그램입니다. 각 팀에는 멘토가 배정되어 함께 성장할 수 있습니다.',
			recommendations: [
				'프로그래밍 언어 경험이 있으신 분',
				'간단한 앱/웹을 만들어 보고 싶으신 분',
				'새로운 언어를 학습하고 싶으신 분'
			]
		}
	];

	const benefits = {
		member: [
			'다양한 온라인 강의 지원',
			'다른 부원들과의 네트워킹',
			'실무 중심의 다양한 특강',
			'MT, 피크닉, 성과 공유회 등 즐거운 친목 활동',
			'중앙동아리 중 최대 규모의 동아리방 (3개)'
		],
		mentor: ['회비 면제', '활동비 지급 (5만원 이상)']
	};

	const otherActivities = [
		{
			title: "연합 해커톤 '달빛톤' (09.13~14)",
			description: '경북대 등 4개 지역 대학과 함께하는 네트워킹 및 프로젝트 공유 행사입니다.'
		},
		{
			title: '앱동 해커톤 & MT (9월 말 또는 10월 초)',
			description: '중간고사 전, 부원들과 함께 즐기는 친목 및 팀워크 강화 활동입니다.'
		},
		{
			title: '피크닉 (중간고사 이후)',
			description: '선선한 가을, 함께 식사하며 다지는 동료애의 시간입니다.'
		},
		{
			title: '성과 공유회 (중간/기말 직후)',
			description: '스터디, 부트캠프 활동 성과를 공유하며 함께 성장하는 시간입니다.'
		}
	];
</script>

<div class="page-container">
	<header class="hero-section">
		<h1 class="main-title">We Make Ideas Happen.</h1>
		<p class="subtitle">
			APPDONG은 '한 학기 동안 하나의 서비스를 완성'하는 것을 목표로,<br />
			아이디어를 현실로 만드는 값진 경험을 함께 만들어갑니다.
		</p>
	</header>

	<section class="section">
		<h2 class="section-title">주요 활동</h2>
		<p class="section-subtitle">
			코딩 실력과 경험 수준에 맞게, 3가지 트랙 중 하나를 선택하여 활동합니다.
		</p>
		<div class="tracks-grid">
			{#each tracks as track (track.title)}
				<div class="track-card">
					{#if track.tag}<span class="tag">{track.tag}</span>{/if}
					<h3>{track.title}</h3>
					<p class="card-description">{track.description}</p>
					<h4>이런 분들께 추천해요!</h4>
					<ul>
						{#each track.recommendations as item (item)}
							<li><span class="checkmark">✔</span>{item}</li>{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">부원 혜택</h2>
		<div class="benefits-grid">
			<div class="benefit-card">
				<h3>모든 부원에게</h3>
				<ul>
					{#each benefits.member as item (item)}
						<li>{item}</li>{/each}
				</ul>
			</div>
			<div class="benefit-card mentor-benefits">
				<h3>멘토 특별 혜택</h3>
				<p>팀을 이끌며 함께 성장하고 싶은 분들은 멘토로도 지원 가능합니다!</p>
				<ul>
					{#each benefits.mentor as item (item)}
						<li><strong>{item}</strong></li>{/each}
				</ul>
			</div>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">함께 만들어가는 동아리 문화</h2>
		<div class="activities-timeline">
			{#each otherActivities as activity (activity.title)}
				<div class="timeline-item">
					<h3>{activity.title}</h3>
					<p>{activity.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<footer class="final-cta">
		<h2 class="section-title">열정과 아이디어가 있다면,<br />당신도 앱동의 멤버입니다.</h2>
		<a href={resolve('/accession')} class="cta-button">2025-2학기 모집 공고 확인하기</a>
	</footer>
</div>

<style>
	/* 2. 두 페이지의 모든 CSS를 여기에 통합하고 정리했습니다. */
	.page-container {
		max-width: 960px;
		margin: 0 auto;
		padding: 4rem 2rem;
	}
	.section {
		margin-bottom: 6rem;
	}
	.section-title {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		text-align: center;
		margin-bottom: 1rem;
	}
	.section-subtitle {
		text-align: center;
		color: var(--secondary-color);
		margin-top: 0;
		margin-bottom: 3rem;
		font-size: 1.1rem;
	}
	.hero-section {
		text-align: center;
		padding: 2rem 0;
		margin-bottom: 5rem;
	}
	.main-title {
		font-family: var(--font-serif);
		font-size: 4rem;
		color: var(--text-color);
	}
	.subtitle {
		font-size: 1.2rem;
		color: var(--secondary-color);
		line-height: 1.7;
		margin: 1.5rem 0 0;
	}
	.tracks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}
	.track-card {
		background-color: #252830;
		padding: 2rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		position: relative;
	}
	.track-card h3 {
		font-size: 1.5rem;
		margin-top: 0;
	}
	.card-description {
		color: var(--secondary-color);
	}
	.tag {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		background-color: var(--primary-color);
		color: white;
		font-size: 0.8rem;
		font-weight: bold;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
	}
	.track-card h4 {
		margin-top: 2rem;
		margin-bottom: 1rem;
		border-top: 1px solid var(--border-color);
		padding-top: 1.5rem;
	}
	.track-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.checkmark {
		color: var(--primary-color);
		margin-right: 0.5rem;
	}
	.benefits-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	.benefit-card {
		background-color: #252830;
		padding: 2.5rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
	}
	.benefit-card h3 {
		font-size: 1.5rem;
		margin-top: 0;
	}
	.benefit-card ul {
		padding-left: 1.2rem;
		line-height: 1.8;
	}
	.mentor-benefits {
		border-color: var(--primary-color);
	}
	.activities-timeline {
		margin-top: 3rem;
		position: relative;
		padding-left: 2rem;
		border-left: 2px solid var(--border-color);
	}
	.timeline-item {
		margin-bottom: 2.5rem;
		position: relative;
	}
	.timeline-item::before {
		content: '';
		position: absolute;
		left: -2.5rem;
		top: 0.5rem;
		width: 12px;
		height: 12px;
		background-color: var(--primary-color);
		border-radius: 50%;
		border: 2px solid var(--bg-color);
	}
	.timeline-item h3 {
		font-size: 1.3rem;
		margin: 0 0 0.5rem;
	}
	.timeline-item p {
		margin: 0;
		color: var(--secondary-color);
	}
	.final-cta {
		text-align: center;
		padding: 5rem 2rem;
		margin-top: 4rem;
		background-color: #1f2128;
		border-radius: 16px;
	}
	.final-cta h2 {
		line-height: 1.4;
	}
	.cta-button {
		display: inline-block;
		background-color: var(--primary-color);
		color: white;
		padding: 1rem 2.5rem;
		border-radius: 999px;
		font-size: 1.1rem;
		font-weight: bold;
		text-decoration: none;
		margin-top: 1rem;
		transition:
			transform 0.2s,
			filter 0.2s;
	}
	.cta-button:hover {
		transform: translateY(-3px);
		filter: brightness(1.1);
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 3rem 1.5rem;
		}
		.main-title {
			font-size: 3rem;
		}
		.benefits-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
