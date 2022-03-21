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
				const element = entry.target as ScrollSceneElement;
				const bounds = entry.boundingClientRect;
				const offset = element.offset;

				const event = entry.isIntersecting ? 'enter' : 'exit';

				element.dispatchEvent(
					new CustomEvent(`scroll-scene-${event}`, {
						bubbles: true,
						detail: {
							bounds,
							isScrollingDown,
							element,
							offset,
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
		this._connectToObserver(this.offset);
	}

	disconnectedCallback() {
		this._disconnectFromObserver(this.offset);
	}

	attributeChangedCallback(attribute: string, previousValue: string) {
		if (attribute === 'offset') {
			const previousOffset = Number.parseFloat(previousValue);

			if (previousOffset !== this.offset) {
				this._disconnectFromObserver(previousOffset);
				this._connectToObserver(this.offset);
			}
		}
	}

	static get observedAttributes() {
		return ['offset'];
	}

	get offset() {
		return Number.parseFloat(this.getAttribute('offset')) || 0.5;
	}

	set offset(value: number) {
		this.setAttribute('offset', value.toString());
	}

	private _connectToObserver(offset: number) {
		let observer = offsetObservers.get(offset);

		if (!observer) {
			observer = createOffsetObserver(offset);
			offsetObservers.set(offset, observer);
		}

		observer.observe(this);
	}

	private _disconnectFromObserver(offset: number) {
		const observer = offsetObservers.get(offset);

		// Is there a race-condition scenario where this does not exist? Not sure.
		if (observer) {
			observer.unobserve(this);
		}
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
