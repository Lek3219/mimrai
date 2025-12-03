"use client";

import type { RouterOutputs } from "@mimir/api/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { create } from "zustand";
import { ColumnIcon } from "@/components/column-icon";
import { ProjectIcon } from "@/components/project-icon";
import { useTasksViewContext } from "@/components/tasks-view/tasks-view";
import { useTasksFilterParams } from "@/hooks/use-tasks-filter-params";
import { trpc } from "@/utils/trpc";
import { AssigneeAvatar } from "../asignee-avatar";

// Types
export type Task = RouterOutputs["tasks"]["get"]["data"][number];
export type Column = RouterOutputs["columns"]["get"]["data"][number];
export type KanbanData = Record<
	string,
	{
		column: {
			id: string;
			name: string;
			type: KanbanBoardGroupBy;
			icon: React.ReactNode;
			// data is used to update the task when moved between columns
			data: any;
		};
		tasks: Task[];
	}
>;
export type KanbanStore = {
	overColumnName?: string;
	activeTaskId?: string;
	setOverColumnName: (name?: string) => void;
	setActiveTaskId: (id?: string) => void;
};
export type GroupByOption<D = any> = {
	label: string;
	updateKey: keyof Task;
	icon: (data: D) => React.ReactNode;
	getData: (item: Task) => D;
	updateData: (item: Partial<Task>, data: D) => void;
	getName: (item: Task) => string;
	getId: (item: Task) => string;
};

// Group By Options
const groupByOptions: Record<KanbanBoardGroupBy, GroupByOption> = {
	column: {
		label: "Column",
		updateKey: "columnId",
		getData: (item) => item.column,
		updateData: (item, data) => {
			item.column = data;
		},
		icon: (data) => <ColumnIcon {...data} className="size-4!" />,
		getName: (item) => item.column.name,
		getId: (item) => item.column.id,
	},
	assignee: {
		label: "Assignee",
		updateKey: "assigneeId",
		icon: (data) => <AssigneeAvatar {...data} className="size-4!" />,
		getData: (item) => item.assignee,
		updateData: (item, data) => {
			item.assignee = data;
		},
		getName: (item) => (item.assignee ? item.assignee.name : "Unassigned"),
		getId: (item) => (item.assignee ? item.assignee.id : "unassigned"),
	},
	project: {
		label: "Project",
		updateKey: "projectId",
		icon: (data) => <ProjectIcon {...data} className="size-4!" />,
		getData: (item) => item.project,
		updateData: (item, data) => {
			item.project = data;
		},
		getName: (item) => (item.project ? item.project.name : "No Project"),
		getId: (item) => (item.project ? item.project.id : "no_project"),
	},
};
export const groupByItems = Object.entries(groupByOptions).map(
	([value, option]) => ({
		value,
		label: option.label,
	}),
);

// Zustand store for kanban drag state
export const useKanbanStore = create<KanbanStore>((set) => ({
	overColumnName: undefined,
	activeTaskId: undefined,
	setOverColumnName: (name) => set({ overColumnName: name }),
	setActiveTaskId: (id) => set({ activeTaskId: id }),
}));

const MIN_ORDER = 0;
const MAX_ORDER = 74000;
const DEFAULT_EMPTY_COLUMN_ORDER = 64000;
export type KanbanBoardGroupBy = "column" | "assignee" | "project";

export function useKanbanBoard() {
	const { tasks, filters } = useTasksViewContext();

	const { groupBy } = useTasksFilterParams();
	const queryClient = useQueryClient();

	// 2. Mutations
	const { mutateAsync: updateTask } = useMutation(
		trpc.tasks.update.mutationOptions(),
	);

	// 3. Derived State (Grouping)
	const boardData = React.useMemo<KanbanData>(() => {
		if (!tasks) return {};

		const priorityOrder: Record<string, number> = {
			urgent: 1,
			high: 2,
			medium: 3,
			low: 4,
		};

		const sortedTasks = [...tasks].sort((a, b) => {
			// Weight-based sorting: each criterion only breaks ties from the previous one
			const comparisons = [
				// 1. Sort by column order (only when grouping by column)
				groupBy === "column" ? a.column.order - b.column.order : 0,
				// 2. Sort by priority (urgent > high > medium > low)
				(priorityOrder[a.priority ?? ""] ?? 5) -
					(priorityOrder[b.priority ?? ""] ?? 5),
				// 3. Sort by due date (earliest first, no due date goes last)
				(a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY) -
					(b.dueDate
						? new Date(b.dueDate).getTime()
						: Number.POSITIVE_INFINITY),
				// 4. Sort by order (fallback)
				a.order - b.order,
			];

			// Return the first non-zero comparison (cascading sort)
			for (const diff of comparisons) {
				if (diff !== 0) return diff;
			}
			return 0;
		});

		// Group by tasks by column name
		return sortedTasks.reduce((acc, task) => {
			const type = (groupBy as KanbanBoardGroupBy) || "column";
			const options = groupByOptions[type];
			const name = options.getName(task);
			const id = options.getId(task);
			const data = options.getData(task);
			const icon = options.icon(data);

			if (!acc[name]) {
				acc[name] = {
					column: {
						id,
						name,
						type,
						icon,
						data,
					},
					tasks: [],
				};
			}
			acc[name]?.tasks.push(task);
			return acc;
		}, {} as KanbanData);

		// return sortedColumns.reduce((acc, column) => {
		// 	acc[column.name] = sortedTasks.filter(
		// 		(task) => task.columnId === column.id,
		// 	);
		// 	return acc;
		// }, {} as KanbanData);
	}, [tasks, groupBy]);

	// 4. Logic: Calculate New Order
	const calculateNewOrder = (
		targetColumnTasks: Task[],
		overItemOrder: number,
		isMovingDown: boolean,
	) => {
		if (isMovingDown) {
			const nextOrder = Math.min(
				MAX_ORDER,
				...targetColumnTasks
					.filter((t) => t.order > overItemOrder)
					.map((t) => t.order),
			);
			return (nextOrder + overItemOrder) / 2;
		}

		const prevOrder = Math.max(
			MIN_ORDER,
			...targetColumnTasks
				.filter((t) => t.order < overItemOrder)
				.map((t) => t.order),
		);
		return (prevOrder + overItemOrder) / 2;
	};

	// 5. Handlers
	// const reorderColumn = async (activeId: string, overId: string) => {
	// 	const activeCol = columns?.data.find((c) => c.name === activeId);
	// 	const overCol = columns?.data.find((c) => c.name === overId);

	// 	if (!activeCol || !overCol || activeCol.id === overCol.id) return;

	// 	// Swap orders
	// 	const newActiveOrder = overCol.order;
	// 	const newOverOrder = activeCol.order;

	// 	// Optimistic update could go here, but usually column moves are fast enough to await
	// 	await Promise.all([
	// 		updateColumn({ id: activeCol.id, order: newActiveOrder }),
	// 		updateColumn({ id: overCol.id, order: newOverOrder }),
	// 	]);

	// 	queryClient.invalidateQueries(trpc.columns.get.queryOptions());
	// };

	const reorderTask = async (
		activeId: string,
		overId: string | undefined,
		overColumnName: string | undefined,
	) => {
		if (!tasks) return;

		const activeTask = tasks.find((t) => t.id === activeId);
		const targetColumn = boardData[overColumnName || ""]?.column;

		// Case A: Moving to an empty column (overId is undefined or null, but we have column name)
		if (activeTask && targetColumn) {
			if (!targetColumn) return;

			const options = groupByOptions[targetColumn.type];
			const columnUpdateKey = options.updateKey;

			const newTaskPayload = {
				id: activeTask.id,
				[columnUpdateKey]: targetColumn.id,
				order: DEFAULT_EMPTY_COLUMN_ORDER,
			};
			options.updateData(newTaskPayload, targetColumn.data);

			updateCache(newTaskPayload);
			await updateTask({
				id: newTaskPayload.id,
				[columnUpdateKey]: newTaskPayload[columnUpdateKey],
				order: newTaskPayload.order,
			});
			return;
		}

		// Case B: Moving relative to another task
		const overTask = tasks.find((t) => t.id === overId);
		if (!activeTask || !overTask) return;

		const options = groupByOptions[groupBy as KanbanBoardGroupBy];
		const columnUpdateKey = options.updateKey;

		const targetColumnTasks = tasks.filter(
			(t) => t[columnUpdateKey] === overTask[columnUpdateKey],
		);
		const newOrder = calculateNewOrder(
			targetColumnTasks,
			overTask.order,
			activeTask.order < overTask.order,
		);

		const newTaskPayload = {
			id: activeTask.id,
			[columnUpdateKey]: overTask[columnUpdateKey],
			order: newOrder,
		};
		options.updateData(newTaskPayload, options.getData(overTask));

		updateCache(newTaskPayload);

		await updateTask({
			id: newTaskPayload.id,
			[columnUpdateKey]: newTaskPayload[columnUpdateKey],
			order: newTaskPayload.order,
		});
	};

	const updateCache = (updatedTask: Partial<Task>) => {
		queryClient.setQueryData(trpc.tasks.get.queryKey(filters), (old) => {
			if (!old) return old;
			return {
				...old,
				data: old.data
					.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
					.sort((a, b) => a.order - b.order),
			};
		});
	};

	return {
		boardData,
		reorderTask,
	};
}
