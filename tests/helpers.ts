// types
import type { Locator } from '@playwright/test';

export function scrollToTopOfElement(locator: Locator) {
	return locator.evaluate((element) => {
		window.scrollTo(
			0,
			element.getBoundingClientRect().top +
				10 +
				window.scrollY -
				window.innerHeight / 2,
		);
	});
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
