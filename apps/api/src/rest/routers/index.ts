import { OpenAPIHono } from "@hono/zod-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context } from "../types";
import { chatRouter } from "./chat";
import { githubRouter } from "./github";
import { integrationsRouter } from "./integrations";

const routers = new OpenAPIHono<Context>();

routers.use(...protectedMiddleware);

// Mount protected routes
routers.route("/chat", chatRouter);
routers.route("/integrations", integrationsRouter);
routers.route("/github", githubRouter);

export { routers };
