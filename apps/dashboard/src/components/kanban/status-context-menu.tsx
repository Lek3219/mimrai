"use client";
import type { RouterOutputs } from "@mimir/api/trpc";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@mimir/ui/context-menu";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStatusParams } from "@/hooks/use-status-params";
import { queryClient, trpc } from "@/utils/trpc";

export const StatusContextMenu = ({
	status,
	children,
}: {
	status: RouterOutputs["statuses"]["get"]["data"][number];
	children: React.ReactNode;
}) => {
	const { setParams } = useStatusParams();

	const { mutate: deleteStatus } = useMutation(
		trpc.statuses.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.statuses.get.queryOptions());
				queryClient.invalidateQueries(trpc.tasks.get.queryOptions());
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	return (
		<ContextMenu>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					onClick={() => {
						queryClient.setQueryData(
							trpc.statuses.getById.queryKey({ id: status.id }),
							status,
						);
						setParams({ statusId: status.id });
					}}
				>
					Edit Status
				</ContextMenuItem>
				<ContextMenuItem
					variant="destructive"
					onClick={() => deleteStatus({ id: status.id })}
				>
					Delete Status
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
