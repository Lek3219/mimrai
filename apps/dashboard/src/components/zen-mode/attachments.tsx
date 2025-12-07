import type { RouterOutputs } from "@api/trpc/routers";
import { FileIcon } from "lucide-react";
import Image from "next/image";

type Task = RouterOutputs["tasks"]["getById"];

export const ZenModeAttachments = ({ task }: { task: Task }) => {
	if (!task?.attachments || task?.attachments.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-4">
			{task.attachments.map((attachment) => (
				<div
					key={attachment}
					className="size-16 overflow-hidden rounded-md border border-border/50"
				>
					{attachment.includes("image/") ? (
						// Image attachment
						// eslint-disable-next-line @next/next/no-img-element
						<Image
							src={attachment}
							alt={"Attachment"}
							className="h-full w-full object-cover"
							width={128}
							height={128}
						/>
					) : (
						// Non-image attachment
						<div className="flex h-full flex-col items-center justify-center bg-background/50">
							<FileIcon className="size-5" />
						</div>
					)}
				</div>
			))}
		</div>
	);
};
