"server-only";
import type { AppRouter } from "@api/trpc/routers";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
import { queryClient } from "./trpc";

export const getCookie = async () => {
	"use server";
	const headersCurrent = await headers();
	return headersCurrent.get("cookie") || "";
};

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
			async headers() {
				const cookieHeader = await getCookie();

				return {
					cookie: cookieHeader,
				};
			},
		}),
		loggerLink({
			enabled: (opts) =>
				process.env.NODE_ENV === "development" ||
				(opts.direction === "down" && opts.result instanceof Error),
		}),
	],
});

export const trpcServer = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient: queryClient,
});
