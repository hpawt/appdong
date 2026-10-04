<script>
	import { resolve, asset } from '$app/paths';
</script>

<section class="hero-section">
	<div class="text-content">
		<h1>
			Hello,<br />
			APPDONG!
		</h1>
		<h2>경북대학교 중앙동아리 앱동</h2>
		<a href={resolve('/about-us')} class="cta-button">동아리 알아보기</a>
	</div>
	<div class="graphic-content">
		<picture>
			<source srcset={asset('/optimized/apdomk.webp')} type="image/webp" />
			<img
				src={asset('/apdomk.png')}
				alt="경북대학교 중앙동아리 앱동 그래픽 일러스트레이션"
				loading="eager"
				decoding="async"
				width="610"
				height="714"
			/>
		</picture>
	</div>
</section>

<style>
	.hero-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: clamp(2rem, 6vw, 6rem) clamp(1rem, 4vw, 2rem);
		gap: clamp(1.5rem, 5vw, 3rem);
		max-width: 1200px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.text-content {
		flex: 1;
		min-width: 0;
		max-width: 100%;
	}

	h1 {
		font-size: clamp(2.5rem, 6vw, 5.25rem);
		line-height: 1.1;
		margin: 0 0 clamp(1rem, 2vw, 2rem) 0;
		color: #fff;
	}

	h2 {
		font-size: clamp(1.1rem, 3vw, 2rem);
		line-height: 1.3;
		margin: 0 0 clamp(1.5rem, 3vw, 2.5rem) 0;
		color: #fff;
	}

	.cta-button {
		display: inline-block;
		font-weight: 500;
		font-size: clamp(1rem, 2vw, 1.2rem);
		color: var(--primary-color, #fff);
		letter-spacing: 1px;
		text-decoration: none;
		padding: 0.8rem 1.6rem;
		border: 1px solid var(--primary-color, #fff);
		border-radius: 4px;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.cta-button:focus-visible {
		outline: 3px solid var(--primary-color, #fff);
		outline-offset: 4px;
	}

	.graphic-content {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		max-width: 450px;
	}

	.graphic-content picture {
		width: 100%;
		display: block;
	}

	.graphic-content img {
		width: 100%;
		height: auto;
		display: block;
		object-fit: contain;
	}

	@media (max-width: 768px) {
		.hero-section {
			flex-direction: column;
			text-align: center;
			padding: clamp(2rem, 6vw, 4rem) 1rem;
		}
		.text-content {
			order: 2;
		}
		.graphic-content {
			order: 1;
			max-width: 300px;
			margin: 0 auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cta-button {
			transition: none;
		}
	}
</style>
