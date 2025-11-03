"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@ui/components/ui/sidebar";
import {
	Command,
	LayersIcon,
	LayoutDashboardIcon,
	LifeBuoy,
	type LucideIcon,
	Send,
	Settings2,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useUser } from "@/hooks/use-user";
import { TeamSwitcher } from "./team-switcher";

type Item = {
	title: string;
	url: string;
	icon: LucideIcon;
	items?: Omit<Item, "icon" | "items">[];
	isActive?: boolean;
};

const data: {
	navMain: Item[];
	navSecondary: Item[];
} = {
	navMain: [
		{
			title: "Overview",
			url: "/dashboard/overview",
			icon: LayoutDashboardIcon,
		},
		{
			title: "Tasks",
			url: "/dashboard/board",
			icon: LayersIcon,
			items: [
				{
					title: "Board",
					url: "/dashboard/board",
				},
				{
					title: "Backlog",
					url: "/dashboard/backlog",
				},
			],
		},
		{
			title: "Settings",
			url: "/dashboard/settings",
			icon: Settings2,
			items: [
				{
					title: "General",
					url: "/dashboard/settings/general",
				},
				{
					title: "Billing",
					url: "/dashboard/settings/billing",
				},
				{
					title: "Members",
					url: "/dashboard/settings/members",
				},
				{
					title: "Labels",
					url: "/dashboard/settings/labels",
				},
				{
					title: "Columns",
					url: "/dashboard/settings/columns",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Support",
			url: "#",
			icon: LifeBuoy,
		},
		{
			title: "Feedback",
			url: "#",
			icon: Send,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const user = useUser();

	return (
		<Sidebar variant="sidebar" {...props}>
			<SidebarHeader className="h-[65px] border-b">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild className="">
							<div className="">
								<TeamSwitcher />
							</div>
							{/*<a
								href="/#"
								className="flex items-center border border-transparent py-2 opacity-90 hover:bg-transparent hover:opacity-100"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{user?.team?.name}
									</span>
									<span className="truncate text-xs">{user?.team?.role}</span>
								</div>
							</a>*/}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter className="border-t">
				<NavUser user={user!} />
			</SidebarFooter>
		</Sidebar>
	);
}
