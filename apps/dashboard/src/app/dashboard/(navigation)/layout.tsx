import { SidebarInset, SidebarProvider } from "@ui/components/ui/sidebar";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatWidget } from "@/components/chat/chat-widget";
import Header from "@/components/header";
import { GlobalSheets } from "@/components/sheets/global-sheets";
import { TasksSuggestions } from "@/components/tasks-suggestions/tasks-suggestions";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{/*<Header />*/}
			<Suspense>
				<SidebarProvider>
					<AppSidebar collapsible="icon" />
					<SidebarInset className="overflow-x-hidden">
						<Header />
						<div className="flex flex-1 flex-col px-6 py-6">{children}</div>
						<ChatWidget />
						<TasksSuggestions />
					</SidebarInset>
				</SidebarProvider>
			</Suspense>
			<Suspense>
				<GlobalSheets />
			</Suspense>
		</>
	);
}
