"use client";

import * as Kanban from "@mimir/ui/kanban";
import { AnimatePresence } from "motion/react";
import { useTasksFilterParams } from "@/hooks/use-tasks-filter-params";
import { TasksFilters } from "./../tasks-filters";
import { BoardColumn } from "./column";
import { useKanbanBoard } from "./use-kanban-board"; // The hook we created above

export function Board() {
	const filters = useTasksFilterParams();

	// Use our custom hook for logic
	const { boardData, columns, reorderColumn, reorderTask } =
		useKanbanBoard(filters);

	const handleDragEnd = async ({
		active,
		over,
	}: {
		active: any;
		over: any;
	}) => {
		if (!over) return;

		const isColumnDrag = columns?.some((col) => col.name === active.id);

		if (isColumnDrag) {
			await reorderColumn(active.id, over.id);
		} else {
			// It is a task drag
			// "over.id" might be a task ID, OR a column name (if dropping on empty column)
			await reorderTask(active.id, over.id, over.id);
		}
	};

	return (
		<div className="h-full grow-1">
			<div className="flex justify-between pb-4">
				<TasksFilters />
			</div>

			<Kanban.Root
				value={boardData}
				getItemValue={(item) => item.id}
				onDragEnd={handleDragEnd}
			>
				<AnimatePresence>
					<Kanban.Board className="flex items-stretch gap-4 overflow-x-auto">
						{Object.entries(boardData).map(([columnName, tasks]) => {
							const column = columns?.find((col) => col.name === columnName);
							if (!column) return null;

							return (
								<BoardColumn
									key={columnName}
									column={column}
									columnName={columnName}
									tasks={tasks}
								/>
							);
						})}
					</Kanban.Board>
				</AnimatePresence>

				<Kanban.Overlay>
					<div className="size-full bg-primary/10" />
				</Kanban.Overlay>
			</Kanban.Root>
		</div>
	);
}
