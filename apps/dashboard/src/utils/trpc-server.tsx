"server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "./trpc";

export function HydrateClient(props: { children: React.ReactNode }) {
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{props.children}
		</HydrationBoundary>
	);
}
