import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import { Suspense } from "react";
import { DoneList } from "./done-list";

export default function Page() {
	return (
		<ChatProvider>
			<Suspense>
				<div className="h-full">
					<DoneList />
				</div>
			</Suspense>
		</ChatProvider>
	);
}
