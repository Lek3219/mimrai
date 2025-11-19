import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import { Suspense } from "react";
import { Board } from "@/components/kanban/board/board";

type Props = {
	searchParams: Promise<{
		chatId?: string;
	}>;
};

export default function DashboardPage({ searchParams }: Props) {
	return (
		<div className="">
			<ChatProvider>
				<div className="flex flex-row gap-6">
					{/*<ChatContainer chatId={chatId} />*/}
					<div className="h-full w-full overflow-hidden">
						<Suspense>
							<Board />
						</Suspense>
					</div>
				</div>
			</ChatProvider>
		</div>
	);
}
