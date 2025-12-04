"use client";

import type { RouterOutputs } from "@mimir/api/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { create } from "zustand";
import {
	type GenericColumn,
	type TasksGroupBy,
	tasksGroupByOptions,
} from "@/components/tasks-view/tasks-group";
import { useTasksViewContext } from "@/components/tasks-view/tasks-view";
import { useTasksFilterParams } from "@/hooks/use-tasks-filter-params";
import { trpc } from "@/utils/trpc";

// Types
export type Task = RouterOutputs["tasks"]["get"]["data"][number];
export type Column = RouterOutputs["columns"]["get"]["data"][number];
export type TeamMember = RouterOutputs["teams"]["getMembers"][number];
export type Project = RouterOutputs["projects"]["get"]["data"][number];

export type KanbanData = Record<
	string,
	{
		column: GenericColumn;
		tasks: Task[];
	}
>;
export type KanbanStore = {
	overColumnName?: string;
	activeTaskId?: string;
	setOverColumnName: (name?: string) => void;
	setActiveTaskId: (id?: string) => void;
};

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

export function useKanbanBoard() {
	const { tasks, filters } = useTasksViewContext();

	const { groupBy } = useTasksFilterParams();
	const queryClient = useQueryClient();

	const { data: columns } = useQuery(
		tasksGroupByOptions[groupBy as TasksGroupBy]?.queryOptions,
	);

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

		const group: KanbanData = {};
		for (const column of columns || []) {
			const options = tasksGroupByOptions[column.type];

			const colName = column.name;
			if (!group[colName]) {
				group[colName] = {
					column,
					tasks: options.select(sortedTasks, column),
				};
			}
		}

		return group;
	}, [tasks, groupBy, columns]);

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

			const options = tasksGroupByOptions[targetColumn.type];
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

		const options = tasksGroupByOptions[groupBy as TasksGroupBy];
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
		queryClient.setQueryData(
			trpc.tasks.get.infiniteQueryKey(filters),
			(old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						data: page.data
							.map((t) =>
								t.id === updatedTask.id ? { ...t, ...updatedTask } : t,
							)
							.sort((a, b) => a.order - b.order),
					})),
				};
			},
		);
	};

	return {
		columns,
		boardData,
		reorderTask,
	};
}
