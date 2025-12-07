"use client";
import type { ZenModeTasks } from "./view";

export const ZenModeQueue = ({
	currentTaskId,
	tasks,
}: {
	currentTaskId: string;
	tasks: ZenModeTasks;
}) => {
	if (!tasks || tasks.length === 0) {
		return null;
	}

	const currentTaskIndex = tasks.findIndex((task) => task.id === currentTaskId);
	const totalTasks = tasks.length;

	return (
		<div className="absolute top-4 right-4 flex items-center gap-4 text-xs">
			<span className="uppercase">QUEUE:</span>
			<span className="text-muted-foreground">{totalTasks} left</span>
			<span className="text-muted-foreground">{currentTaskIndex} skipped</span>
		</div>
	);
};
