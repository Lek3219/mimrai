import type { teamRoleEnum } from "@db/schema/schemas";
import type { InferEnum } from "drizzle-orm/";

export const SCOPES = ["team:write"] as const;
export type Scope = (typeof SCOPES)[number];

export const roleScopes: Record<InferEnum<typeof teamRoleEnum>, Scope[]> = {
	owner: ["team:write"],
	member: [],
};
