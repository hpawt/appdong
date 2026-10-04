<!-- src/routes/components/Introduction.svelte -->
<section class="intro-section">
	<div class="definition">
		<span class="phonetic">/AppDong/</span>
		<span class="tag">경북대학교 중앙동아리</span>
		<p class="meaning">열정있는 당신, 그리고 누구나</p>
	</div>
	<div class="description">
		앱동은, 한 학기동안 한 명이 앱이나 웹 서비스 하나를 완성하는 것을 목표로 활동합니다.<br />
		앱동은 코딩 실력과 경험 수준에 맞게, Vibe 클래스 / 스터디 / 부트캠프로 나누어 메인 활동을 진행합니다.
		<br />
		각 부원은 스터디, 부트캠프 또는 Vibe 클래스를 선택하여 참여할 수 있습니다.<br />
	</div>
</section>

<style>
	.intro-section {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 4rem;
		padding: 6rem 0;
		align-items: center;
	}
	.phonetic {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		color: var(--primary-color);
	}
	.tag {
		display: inline-block;
		white-space: nowrap;
		background-color: #444;
		color: #fff;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		margin-left: 1rem;
	}
	.meaning {
		font-size: 1.2rem;
		color: var(--secondary-color);
		margin-top: 0.5rem;
	}

	@media (max-width: 768px) {
		.phonetic {
			display: block;
		}
		.tag {
			margin: 0.75rem 0 0;
		}
		.intro-section {
			grid-template-columns: 1fr;
			gap: 2rem;
			padding: 4rem 0;
			text-align: center;
		}
	}
</style>
