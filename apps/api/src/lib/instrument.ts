import { init } from "@sentry/node";

init({
	dsn: process.env.SENTRY_DSN!,
	sendDefaultPii: true,
	// enabled: process.env.NODE_ENV === "production",
});
