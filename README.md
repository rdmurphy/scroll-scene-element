# `<scroll-scene>` element

A tiny custom element for all your scrollytelling needs! The successor to [`@newswire/scroller`](https://github.com/rdmurphy/scroller).

## Key features

- 🐜 **Less than 700 bytes** brotli'ed, **less than 800 bytes** gzip'ed
- 👀 Uses a highly-performant **[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)** to monitor scrolling changes
- 📚 Smartly uses scroll events to **calculate scroll progress** only when needed
- 🌻 Each `<scroll-scene>` element may **have its own** `offset` and **opt-in** to `progress` events
- 🙅🏽‍ **No dependencies**

## Examples

- [Basic usage](https://rdmurphy.github.io/scroll-scene-element/basic)
- [Sticky graphics](https://rdmurphy.github.io/scroll-scene-element/sticky)
- [Progress events](https://rdmurphy.github.io/scroll-scene-element/progress)

## Installation

```sh
npm install scroll-scene-element
// or
yarn add scroll-scene-element
// or
pnpm add scroll-scene-element
```

## Usage

In your HTML add `<scroll-scene>` container elements around every "scene" you want to track the progression of in your interactive. Feel free to use these elements as the containers of your graphics or other dynamic content and style them as needed - all progression and scroll depth changes will be tracked on the tag and its contents.

```html
<div class="scrollytelling-container">
	<scroll-scene>
		<h2>Scene 1</h2>
		<p>This is the first scene.</p>
	</scroll-scene>
	<scroll-scene>
		<h2>Scene 2</h2>
		<p>This is the first scene.</p>
	</scroll-scene>
	<scroll-scene>
		<h2>Scene 3</h2>
		<p>This is the first scene.</p>
	</scroll-scene>
</div>
```

Then import the script as an ES module in your bundle or load via a script tag to upgrade the `<scroll-scene>` elements:

```js
import 'scroll-scene-element';
```

_or_

<!-- prettier-ignore -->
```html
<script src="https://unpkg.com/scroll-scene-element/dist/index.js" type="module"></script>
```

If you have experience with [Scrollama](https://github.com/russellgoldenberg/scrollama) or [`@newswire/scroller`](https://github.com/rdmurphy/scroller) it may be surprising that there's no "init" step. Thanks to custom elements the initalization happens automatically just by using `<scroll-scene>`.

Events with `<scroll-scene>` work just like others in JavaScript giving you the same amount of flexibility. (And familiarity!) `scroll-scene-enter`, `scroll-scene-exit` and `scroll-scene-progress` all bubble up to `document`. If you know there will only be a single set of `<scroll-scene>` elements on a page you may listen on `document` directly:

```js
document.addEventListener('scroll-scene-enter', (event) => {
	// "event" is a CustomEvent, giving it has a `detail` property
	const detail = event.detail;

	// the triggering element
	const element = event.element;

	// just like in standard DOM events, "target" is also the triggering element
	const target = event.target;

	// the bounds of the triggering element
	const bounds = detail.bounds;

	// whether the page was scrolling up or down when the event was triggered
	const isScrollingDown = detail.isScrollingDown;

	// the offset used for this element
	const offset = detail.offset;
});
```

But what if you have more than one set of `<scroll-scene>` elements on a page? You might instead attach your listener to a parent element of each set of `<scroll-scene>` elements:

```js
const container = document.querySelector('.scrollytelling-container');

container.addEventListener('scroll-scene-enter', (event) => {
	// no need to allow it to bubble up to `document`
	event.stopPropagation();

	// "event" is a CustomEvent, giving it has a `detail` property
	const detail = event.detail;

	// ...
});
```

And finally - you may attach your listener to each `<scroll-scene>` element individually:

```js
const scenes = document.querySelectorAll('scroll-scene');

scenes.forEach((scene) => {
	scene.addEventListener('scroll-scene-enter', (event) => {
		// no need to allow it to bubble up to `document`
		event.stopPropagation();

		// "event" is a CustomEvent, giving it has a `detail` property
		const detail = event.detail;

		// ...
	});
});
```

Maybe you only need to know the first time a scene enters (or exits) the viewport? You can use the native `once` option with `addEventListener`:

```js
const scene = document.querySelector('scroll-scene');

scene.addEventListener(
	'scroll-scene-enter',
	() => {
		console.log('Entered!');
	},
	{ once: true },
);

scene.addEventListener(
	'scroll-scene-exit',
	() => {
		console.log('Exited!');
	},
	{ once: true },
);
```

If a `<scroll-scene>` element opts-in to `progress` tracking, it will emit a `scroll-scene-progress` event when the progress changes once it enters and stop emitting the event once it exits. This event will bubble up to `document`:

```html
<scroll-scene progress>
	<h2>Scene 1</h2>
	<p>This is the first scene.</p>
</scroll-scene>
```

```js
const scene = document.querySelector('scroll-scene');

scene.addEventListener('scroll-scene-progress', (event) => {
	// "event" is a CustomEvent, giving it has a `detail` property
	const detail = event.detail;

	// the triggering element
	const element = event.element;

	// `event.target` is also the triggering element, just like in standard DOM events
	const target = event.target;

	// the bounds of the triggering element
	const bounds = detail.bounds;

	// the offset used for this element
	const offset = detail.offset;

	// the progress of the element from 0 to 1
	const progress = detail.progress;
});
```

## Attributes

A `<scroll-scene>` element has two optional attributes:

- `offset`: a number between 0 and 1 that determines how far from the top of the viewport the element must be before a `scroll-scene-enter` or `scroll-scene-exit` event is triggered. Defaults to `0.5`.
- `progress`: a boolean that determines whether the `scroll-scene-progress` event is triggered. Defaults to `false`.

These can be set on the `<scroll-scene>` element as an attribute or be passed in as a property.

```html
<scroll-scene offset="0.75"></scroll-scene>
<scroll-scene progress></scroll-scene>
```

```js
const scene = document.querySelector('scroll-scene');

// as properties
scene.offset = 0.75;
scene.progress = true;

// as attributes
scene.setAttribute('offset', '0.75');
scene.setAttribute('progress', '');
```

## Events

### Viewport events

**`scroll-scene-enter`** is emit when an element enters the viewport. **`scroll-scene-exit`** is emit when an element exits the viewport. Both events bubble up to `document`. They both have a `detail` property that contains the following:

- `bounds`: the bounds ([`DOMRectReadOnly`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly)) of the triggering element as made available within the `IntersectionObserver` callback
- `element`: the triggering element
- `isScrollingDown`: whether the page was scrolling up or down when the event was triggered
- `offset`: the offset used for this element

### Progress event

**`scroll-scene-progress`** is emitted when the progress of an element changes. It bubbles up to `document` and has a `detail` property that contains the following:

- `bounds`: the bounds ([`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect)) of the triggering element
- `element`: the triggering element
- `offset`: the offset used for this element
- `progress`: the progress of the element from 0 to 1

## License

MIT
