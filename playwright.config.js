/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	reporter: process.env.CI ? [['github'], ['dot']] : 'list',
	webServer: {
		command: 'npm run start',
		port: 3000,
		timeout: 120 * 1000,
		reuseExistingServer: !process.env.CI,
	},
	use: {
		browserName: process.env.BROWSER || 'chromium',
	},
};

export default config;
