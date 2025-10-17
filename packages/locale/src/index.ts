import * as locales from "./locales";

export function t(key: string, locale = "en"): string {
	const parsedLocales = { ...locales } as Record<string, any>;
	const translations = parsedLocales[locale] ?? locales.en;
	const path = key.split(".");

	let result: any = translations;
	for (const segment of path) {
		result = result ? result[segment] : undefined;
		console.log(result, segment);
	}

	return result || key;
}
