import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import { TasksList } from "./tasks-list";

export default function Page() {
	return (
		<ChatProvider>
			<TasksList />
		</ChatProvider>
	);
}
