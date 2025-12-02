import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import { Suspense } from "react";
import { BacklogList } from "./backlog-list";

export default function Page() {
	return (
		<ChatProvider>
			<Suspense>
				<div className="py-4">
					<BacklogList />
				</div>
			</Suspense>
		</ChatProvider>
	);
}
