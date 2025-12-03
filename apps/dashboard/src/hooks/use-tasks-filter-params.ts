import { parseAsBoolean, useQueryStates } from "nuqs";
import { createLoader, parseAsArrayOf, parseAsString } from "nuqs/server";

// async import properties list to avoid circular dependency
const { propertiesList } = await import(
	"../components/tasks-view/task-properties"
);

export const tasksFilterParams = {
	assigneeId: parseAsArrayOf(parseAsString),
	columnId: parseAsArrayOf(parseAsString),
	columnType: parseAsArrayOf(parseAsString),
	taskProjectId: parseAsArrayOf(parseAsString),
	taskMilestoneId: parseAsArrayOf(parseAsString),
	search: parseAsString,
	labels: parseAsArrayOf(parseAsString),
	groupBy: parseAsString.withDefault("column"),
	viewType: parseAsString,
	properties: parseAsArrayOf(parseAsString).withDefault(propertiesList),
	recurring: parseAsBoolean,
};

export const useTasksFilterParams = () => {
	const [params, setParams] = useQueryStates(tasksFilterParams);

	return {
		...params,
		setParams,
	};
};

export const loadTasksFilterParams = createLoader(tasksFilterParams);
