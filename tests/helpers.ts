// types
import type { Locator, Page } from '@playwright/test';

export function scrollTopOfElementToOffset(locator: Locator, offset: number) {
	return locator.evaluate((element, offset) => {
		window.scrollTo(
			0,
			element.getBoundingClientRect().top +
				window.scrollY -
				window.innerHeight * (1 - offset),
		);
	}, offset);
}

export function scrollToTopOfElement(locator: Locator) {
	return scrollTopOfElementToOffset(locator, 0.5);
}

export function scrollWindowToElementOffsetDepth(
	locator: Locator,
	offset: number,
	depth: number,
) {
	return locator.evaluate(
		(element, [offset, depth]) => {
			const bounds = element.getBoundingClientRect();
			window.scrollTo(
				0,
				bounds.top +
					bounds.height * depth +
					window.scrollY -
					window.innerHeight * (1 - offset),
			);
		},
		[offset, depth],
	);
}

export function scrollAboveElement(locator: Locator) {
	return locator.evaluate((element) => {
		window.scrollTo(
			0,
			element.getBoundingClientRect().top -
				1 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
}

export async function scrollToTop(page: Page) {
	await page.evaluate(() => {
		window.scrollTo(0, 0);
	});

	// don't love it but gotta wait for the scroll to finish
	return tick(page);
}

export function scrollBelowElement(locator: Locator) {
	return locator.evaluate((element) => {
		window.scrollTo(
			0,
			element.getBoundingClientRect().bottom +
				1 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
}

export function tick(page: Page) {
	return page.evaluate(() => new Promise(requestAnimationFrame));
}
