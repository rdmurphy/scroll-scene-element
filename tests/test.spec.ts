// packages
import { test, expect } from '@playwright/test';

// local
import {
	scrollBelowElement,
	scrollTopOfElementToOffset,
	scrollToTop,
	scrollToTopOfElement,
	scrollWindowToElementOffsetDepth,
} from './helpers';

// types
import type ScrollSceneElement from '../src/scroll-scene-element';

test.describe('scroll-scene', () => {
	test.describe('element creation', () => {
		test('creates from document.createElement', async ({ page }) => {
			await page.goto('/tests/fixtures/basic.html');

			const elementHandle = await page.evaluateHandle(() =>
				document.createElement('scroll-scene'),
			);

			expect(await elementHandle.evaluate((element) => element.nodeName)).toBe(
				'SCROLL-SCENE',
			);
		});

		test('creates from constructor', async ({ page }) => {
			await page.goto('/tests/fixtures/basic.html');

			const elementHandle = await page.evaluateHandle(() => {
				return new window.ScrollSceneElement();
			});

			expect(await elementHandle.evaluate((element) => element.nodeName)).toBe(
				'SCROLL-SCENE',
			);
		});
	});

	test.describe('functionality', () => {
		test('fires an event on enter and exit', async ({ page }) => {
			await page.goto('/tests/fixtures/integration.html');

			const locator = page.locator('scroll-scene');

			// enter
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', resolve),
						),
				),
				scrollToTopOfElement(locator),
			]);

			// exit
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-exit', resolve),
						),
				),
				scrollBelowElement(locator),
			]);
		});

		test('confirm return values in event', async ({ page }) => {
			await page.goto('/tests/fixtures/integration.html');

			const locator = page.locator('scroll-scene');

			const [detail] = await Promise.all([
				locator.evaluateHandle(
					(element: ScrollSceneElement) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', (event) => {
								resolve((event as CustomEvent).detail);
							}),
						),
				),
				scrollToTopOfElement(locator),
			]);

			// bounds
			const isDOMRectReadOnly = await detail.evaluate((detail) => {
				return detail.bounds instanceof DOMRectReadOnly;
			});
			expect(isDOMRectReadOnly).toBe(true);

			// isScrollingDown
			const isScrollingDown = await detail.evaluate(
				(detail) => detail.isScrollingDown,
			);
			expect(isScrollingDown).toBe(true);

			// element
			const isSameElement = await locator.evaluate((element, detail) => {
				return element === detail.element;
			}, detail);
			expect(isSameElement).toBe(true);

			// offset
			const offset = await detail.evaluate((detail) => detail.offset);
			expect(offset).toBe(0.5);
		});

		test('elements may have have custom offsets', async ({ page }) => {
			await page.goto('/tests/fixtures/offset.html');

			const defaultOffsetLocator = page.locator('scroll-scene:not([offset])');
			const customOffsetLocator = page.locator('scroll-scene[offset]');

			// smoke test to confirm default works
			await Promise.all([
				defaultOffsetLocator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', resolve),
						),
				),
				scrollTopOfElementToOffset(defaultOffsetLocator, 0.5),
			]);

			// test custom offset
			await Promise.all([
				customOffsetLocator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', resolve),
						),
				),
				scrollTopOfElementToOffset(customOffsetLocator, 0.7),
			]);
		});

		test('elements may have offsets dynamically set', async ({ page }) => {
			await page.goto('/tests/fixtures/integration.html');

			const locator = page.locator('scroll-scene');

			// smoke test to confirm default works
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', resolve, {
								once: true,
							}),
						),
				),
				scrollTopOfElementToOffset(locator, 0.5),
			]);

			// reset our scroll position
			await scrollToTop(page);
			// set the offset with assignment
			await locator.evaluate(
				(element: ScrollSceneElement) => (element.offset = 0.6),
			);

			// confirm an offset can be set dynamically
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', resolve, {
								once: true,
							}),
						),
				),
				scrollTopOfElementToOffset(locator, 0.6),
			]);

			// reset our scroll position
			await scrollToTop(page);
			// set the offset with setAttribute
			await locator.evaluate((element: ScrollSceneElement) =>
				element.setAttribute('offset', '0.7'),
			);

			// confirm an offset can be set dynamically
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener('scroll-scene-enter', resolve, {
								once: true,
							}),
						),
				),
				scrollTopOfElementToOffset(locator, 0.7),
			]);
		});

		test('elements may opt-in to progress events', async ({ page }) => {
			await page.goto('/tests/fixtures/progress.html');

			const locator = page.locator('scroll-scene');
			const offset = 0.5;
			const depth = 0.75;

			// confirm progress events begin once the offset is reached
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener(
								'scroll-scene-progress',
								function progress(event) {
									if ((event as CustomEvent).detail.progress === 0) {
										element.removeEventListener(
											'scroll-scene-progress',
											progress,
										);
										resolve(true);
									}
								},
							),
						),
				),
				scrollWindowToElementOffsetDepth(locator, offset, 0),
			]);

			// make sure progress events continue as you scroll
			await Promise.all([
				locator.evaluate(
					(element, depth) =>
						new Promise((resolve) =>
							element.addEventListener(
								'scroll-scene-progress',
								function progress(event) {
									const detail = (event as CustomEvent).detail;

									if (detail.progress >= depth) {
										element.removeEventListener(
											'scroll-scene-progress',
											progress,
										);
										resolve(true);
									}
								},
							),
						),
					depth,
				),
				scrollWindowToElementOffsetDepth(locator, offset, 0.75),
			]);

			// make sure it maxes out at 1
			await Promise.all([
				locator.evaluate(
					(element) =>
						new Promise((resolve) =>
							element.addEventListener(
								'scroll-scene-progress',
								function progress(event) {
									const detail = (event as CustomEvent).detail;

									if (detail.progress === 1) {
										element.removeEventListener(
											'scroll-scene-progress',
											progress,
										);
										resolve(true);
									}
								},
							),
						),
				),
				scrollBelowElement(locator),
			]);
		});
	});
});
