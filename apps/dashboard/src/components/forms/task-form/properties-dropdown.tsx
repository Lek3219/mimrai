import { useMutation } from "@tanstack/react-query";
import { Button } from "@ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@ui/components/ui/dropdown-menu";
import { EllipsisIcon, FlagIcon } from "lucide-react";
import { trpc } from "@/utils/trpc";

export const TaskFormPropertiesDropdown = () => {
	const { mutate: createDependency } = useMutation(
		trpc.taskDependencies.create.mutationOptions(),
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-6 w-8">
					<EllipsisIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					<FlagIcon />
					Related to...
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
