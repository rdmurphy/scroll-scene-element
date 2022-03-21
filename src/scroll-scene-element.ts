const offsetObservers = new Map<number, IntersectionObserver>();
type ProgressCommands = { on: () => void; off: () => void };
const progressListeners = new WeakMap<ScrollSceneElement, ProgressCommands>();

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
				const progress = element.progress;
				const isIntersecting = entry.isIntersecting;

				if (progress) {
					let commands = progressListeners.get(element);

					if (!commands) {
						commands = observeProgress(element);
						progressListeners.set(element, commands);
					}

					if (isIntersecting) {
						commands.on();
					} else {
						commands.off();
					}
				}

				element.dispatchEvent(
					new CustomEvent(`scroll-scene-${isIntersecting ? 'enter' : 'exit'}`, {
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

function observeProgress(element: ScrollSceneElement): ProgressCommands {
	/**
	 * Called on each scroll event.
	 */
	function scroll() {
		const bounds = element.getBoundingClientRect();
		const offset = element.offset;
		const top = bounds.top;
		const bottom = bounds.bottom;
		// ensure progress is never less than 0 or greater than 1
		const progress = Math.max(
			0,
			Math.min((window.innerHeight * offset - top) / (bottom - top), 1),
		);

		element.dispatchEvent(
			new CustomEvent('scroll-scene-progress', {
				bubbles: true,
				detail: {
					bounds,
					element,
					progress,
					offset,
				},
			}),
		);
	}

	return {
		on() {
			// initial hit
			scroll();
			window.addEventListener('scroll', scroll, false);
		},
		off() {
			window.removeEventListener('scroll', scroll, false);
		},
	};
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
		return ['offset', 'progress'];
	}

	get offset() {
		return Number.parseFloat(this.getAttribute('offset')) || 0.5;
	}

	set offset(value: number) {
		this.setAttribute('offset', value.toString());
	}

	get progress() {
		return this.hasAttribute('progress');
	}

	set progress(value: boolean) {
		if (value) {
			this.setAttribute('progress', '');
		} else {
			this.removeAttribute('progress');
		}
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
