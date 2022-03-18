// packages
import { test, expect } from '@playwright/test';

// local
import { scrollBelowElement, scrollToTopOfElement } from './helpers';

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
	});
});
