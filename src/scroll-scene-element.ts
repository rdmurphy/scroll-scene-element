let previousOffset = 0;
let isScrollingDown = false;

const observer = new IntersectionObserver(
	(entries) => {
		const offset = window.pageYOffset;
		isScrollingDown = offset > previousOffset;
		previousOffset = offset;

		for (const entry of entries) {
			const element = entry.target as HTMLElement;
			const bounds = entry.boundingClientRect;

			const event = entry.isIntersecting ? 'enter' : 'exit';

			element.dispatchEvent(
				new CustomEvent(`scroll-scene-${event}`, {
					bubbles: true,
					detail: {
						bounds,
						isScrollingDown,
						element,
					},
				}),
			);
		}
	},
	{
		rootMargin: '-50% 0px -50%',
	},
);

class ScrollSceneElement extends HTMLElement {
	connectedCallback() {
		observer.observe(this);
	}

	disconnectedCallback() {
		observer.unobserve(this);
	}
}

declare global {
	interface Window {
		ScrollSceneElement: typeof ScrollSceneElement;
	}
}

export default ScrollSceneElement;

if (!window.customElements.get('scroll-scene')) {
	window.ScrollSceneElement = ScrollSceneElement;
	window.customElements.define('scroll-scene', ScrollSceneElement);
}
