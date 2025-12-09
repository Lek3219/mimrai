"use client";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@mimir/ui/sheet";
import { useStatusParams } from "@/hooks/use-status-params";
import { StatusForm } from "../forms/status-form";

export const StatusCreateSheet = () => {
	const { createStatus, setParams } = useStatusParams();

	const isOpen = Boolean(createStatus);

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Create Status</SheetTitle>
					<SheetDescription>
						Create a new status for your project.
					</SheetDescription>
				</SheetHeader>

				<StatusForm defaultValues={{}} />
			</SheetContent>
		</Sheet>
	);
};
