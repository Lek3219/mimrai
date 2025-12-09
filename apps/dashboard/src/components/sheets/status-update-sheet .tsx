"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@mimir/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useStatusParams } from "@/hooks/use-status-params";
import { trpc } from "@/utils/trpc";
import { StatusForm } from "../forms/status-form";

export const StatusUpdateSheet = () => {
	const { statusId, setParams } = useStatusParams();

	const isOpen = Boolean(statusId);

	const { data: status } = useQuery(
		trpc.statuses.getById.queryOptions(
			{ id: statusId! },
			{
				enabled: isOpen,
			},
		),
	);

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Update Status</SheetTitle>
				</SheetHeader>

				<StatusForm
					defaultValues={{
						id: status?.id,
						name: status?.name || "",
						description: status?.description || "",
						type: status?.type || "in_progress",
					}}
				/>
			</SheetContent>
		</Sheet>
	);
};
