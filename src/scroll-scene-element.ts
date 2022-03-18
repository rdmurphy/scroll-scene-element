const offsetObservers = new Map<number, IntersectionObserver>();
let previousScrollDepth = 0;
let isScrollingDown = false;

function createOffsetObserver(offset: number) {
	return new IntersectionObserver(
		(entries) => {
			const scrollDepth = window.pageYOffset;
			isScrollingDown = scrollDepth > previousScrollDepth;
			previousScrollDepth = scrollDepth;

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
			rootMargin: `${-100 * (1 - offset)}% 0px ${-100 * offset}%`,
		},
	);
}

class ScrollSceneElement extends HTMLElement {
	connectedCallback() {
		const offset = this.offset;

		let observer = offsetObservers.get(offset);

		if (!observer) {
			observer = createOffsetObserver(offset);
			offsetObservers.set(offset, observer);
		}

		observer.observe(this);
	}

	disconnectedCallback() {
		const offset = this.offset;
		const observer = offsetObservers.get(offset);

		// Would this ever not exist? Not sure.
		if (observer) {
			observer.unobserve(this);
		}
	}

	get offset() {
		return Number.parseFloat(this.getAttribute('offset') || '0.5');
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
