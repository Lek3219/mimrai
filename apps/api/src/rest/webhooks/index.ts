import { OpenAPIHono } from "@hono/zod-openapi";
import { githubWebhook } from "./github";
import { stripeWebhook } from "./stripe";
import { twilioWebhook } from "./twilio";

const webhooks = new OpenAPIHono();

webhooks.route("/stripe", stripeWebhook);
webhooks.route("/github", githubWebhook);
webhooks.route("/twilio", twilioWebhook);

export { webhooks as webhooksRouters };
