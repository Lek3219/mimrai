import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useTaskLabelParams() {
	const [params, setParams] = useQueryStates({
		taskLabelId: parseAsString,
		createTaskLabel: parseAsBoolean,
	});

	return {
		...params,
		setParams,
	};
}
