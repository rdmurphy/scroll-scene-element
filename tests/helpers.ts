// types
import type { Locator } from '@playwright/test';

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
