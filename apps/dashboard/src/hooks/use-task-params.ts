import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useTaskParams() {
	const [params, setParams] = useQueryStates({
		taskId: parseAsString,
		taskStatusId: parseAsString,
		taskProjectId: parseAsString,
		createTask: parseAsBoolean,
	});

	return {
		...params,
		setParams,
	};
}
