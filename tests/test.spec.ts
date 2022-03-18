import { test, expect } from '@playwright/test';

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
});
