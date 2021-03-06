const DEFAULT_OFFSET = 0.5;
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

function connectToObserver(element: ScrollSceneElement, offset: number) {
	let observer = offsetObservers.get(offset);

	if (!observer) {
		observer = createOffsetObserver(offset);
		offsetObservers.set(offset, observer);
	}

	observer.observe(element);
}

function disconnectFromObserver(element: ScrollSceneElement, offset: number) {
	const observer = offsetObservers.get(offset);

	// Is there a race-condition scenario where this does not exist? Not sure.
	if (observer) {
		observer.unobserve(element);
	}
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
			Math.min((window.innerHeight * (1 - offset) - top) / (bottom - top), 1),
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
		connectToObserver(this, this.offset);
	}

	disconnectedCallback() {
		disconnectFromObserver(this, this.offset);
	}

	attributeChangedCallback(attribute: string, oldValue: string) {
		if (attribute === 'offset') {
			const previousOffset = Number.parseFloat(oldValue) || DEFAULT_OFFSET;

			if (previousOffset !== this.offset) {
				disconnectFromObserver(this, previousOffset);
				connectToObserver(this, this.offset);
			}
		}
	}

	static get observedAttributes() {
		return ['offset', 'progress'];
	}

	get offset() {
		return Number.parseFloat(this.getAttribute('offset')) || DEFAULT_OFFSET;
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
