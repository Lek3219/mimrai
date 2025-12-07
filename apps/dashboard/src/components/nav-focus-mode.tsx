import { Button } from "@ui/components/ui/button";
import { cn } from "@ui/lib/utils";
import { Maximize2Icon } from "lucide-react";
import Link from "next/link";

export const NavZenMode = () => {
	return (
		<Link href="/dashboard/zen">
			<Button
				size={"sm"}
				className={cn("relative rounded-full px-4! text-xs")}
				type="button"
				variant={"secondary"}
			>
				<Maximize2Icon className="size-3.5" />
				Zen Mode
			</Button>
		</Link>
	);
};
