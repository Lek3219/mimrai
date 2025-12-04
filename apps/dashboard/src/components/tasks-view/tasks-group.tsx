import type { RouterOutputs } from "@api/trpc/routers";
import type { UseQueryOptions } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { ColumnIcon } from "../column-icon";
import { AssigneeAvatar } from "../kanban/asignee-avatar";
import { ProjectIcon } from "../project-icon";

export type Task = RouterOutputs["tasks"]["get"]["data"][number];
export type Column = RouterOutputs["columns"]["get"]["data"][number];
export type TeamMember = RouterOutputs["teams"]["getMembers"][number];
export type Project = RouterOutputs["projects"]["get"]["data"][number];
export type TasksGroupBy = "column" | "assignee" | "project";

export type GenericColumn<O = any> = {
	id: string;
	name: string;
	type: TasksGroupBy;
	icon: React.ReactNode;
	data: any;
	original: O;
};
export type GroupByOption<O = any, D = GenericColumn<O>, DD = Array<D>> = {
	label: string;
	updateKey: keyof Task;
	getData: (item: Task) => any;
	updateData: (item: Partial<Task>, data: any) => void;
	select: (tasks: Task[], column: O) => Task[];

	queryOptions: UseQueryOptions<DD, any, DD, any>;
};

// Group By Options
export const tasksGroupByOptions: Record<TasksGroupBy, GroupByOption> = {
	column: {
		label: "Column",
		updateKey: "columnId",
		getData: (item) => item.column,
		updateData: (item, data) => {
			item.column = data;
		},
		select: (tasks, column) => tasks.filter((t) => t.columnId === column.id),

		queryOptions: trpc.columns.get.queryOptions(
			{
				type: ["to_do", "in_progress", "review", "done"],
			},
			{
				select: (columns) => {
					return columns.data.map((column) => ({
						id: column.id,
						name: column.name,
						type: "column" as const,
						icon: <ColumnIcon {...column} className="size-4!" />,
						data: column,
						original: column,
					}));
				},
			},
		),
	} as GroupByOption<Column>,
	assignee: {
		label: "Assignee",
		updateKey: "assigneeId",
		getData: (item) => item.assignee,
		updateData: (item, data) => {
			item.assignee = data;
		},
		select: (tasks, column) => tasks.filter((t) => t.assigneeId === column.id),

		queryOptions: trpc.teams.getMembers.queryOptions(
			{},
			{
				select: (members) => {
					return members.map((member) => ({
						id: member.id,
						name: member.name || "No Name",
						type: "assignee" as const,
						icon: <AssigneeAvatar {...member} className="size-4!" />,
						data: member,
						original: member,
					}));
				},
			},
		),
	} as GroupByOption<TeamMember>,
	project: {
		label: "Project",
		updateKey: "projectId",
		getData: (item) => item.project,
		updateData: (item, data) => {
			item.project = data;
		},
		select: (tasks, column) => tasks.filter((t) => t.projectId === column.id),

		queryOptions: trpc.projects.get.queryOptions(
			{},
			{
				select: (projects) => {
					return projects.data.map((project) => ({
						id: project.id,
						name: project.name,
						type: "project" as const,
						icon: <ProjectIcon {...project} className="size-4!" />,
						data: project,
						original: project,
					}));
				},
			},
		),
	} as GroupByOption<Project>,
};
export const tasksGroupByItems = Object.entries(tasksGroupByOptions).map(
	([value, option]) => ({
		value,
		label: option.label,
	}),
);
