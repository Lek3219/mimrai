"use client";
import { Provider, type UIMessage } from "@ai-sdk-tools/store";
import { useQuery } from "@tanstack/react-query";
import { generateId } from "ai";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { ChatInterface } from "./chat-interface";

export type ChatContainerState = {
	chatId?: string;
	show: boolean;
	toggle: (value?: boolean) => void;
	setChatId: (chatId: string) => void;
};

export const useChatWidget = create<ChatContainerState>()((set, get) => ({
	show: false,
	toggle: (value) => set({ show: value !== undefined ? value : !get().show }),
	setChatId: (chatId) => set({ chatId }),
}));

export const ChatWidget = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [hover, setHover] = useState(false);
	const { show, toggle, chatId, setChatId } = useChatWidget();

	const { data: initialMessages, isFetched } = useQuery(
		trpc.chats.get.queryOptions(
			{
				chatId: chatId!,
			},
			{
				enabled: !!chatId,
			},
		),
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (chatId) return;
		const storedChatId = window.localStorage.getItem("chat-id");
		if (storedChatId) {
			setChatId(storedChatId);
		} else {
			const newChatId = generateId();
			setChatId(newChatId);
			window.localStorage.setItem("chat-id", newChatId);
		}
	}, []);

	return (
		<div className="pointer-events-none absolute inset-0 z-10">
			<div
				className={cn("absolute inset-0 transition-all", {
					"pointer-events-auto bg-background": show,
					"pointer-events-none": !show,
				})}
			/>
			<div
				ref={containerRef}
				className={cn(
					"-translate-x-1/2 pointer-events-auto fixed bottom-0 left-1/2 pb-2 transition-all",
					{
						"translate-y-[80%]": !show && !hover,
						"translate-y-[50%]": hover && !show,
					},
				)}
				onClick={() => {
					toggle(false);
				}}
				onMouseEnter={() => {
					setHover(true);
					// containerRef.current?.querySelector("textarea")?.focus();
				}}
				onMouseLeave={() => {
					setHover(false);
					// toggle(false);
					// containerRef.current?.querySelector("textarea")?.blur();
				}}
			>
				<div
					className="w-[50vw] bg-transparent"
					onClick={(e) => {
						e.stopPropagation();
						toggle(true);
					}}
				>
					{isFetched && (
						<Provider
							initialMessages={initialMessages?.messages as UIMessage[]}
						>
							<ChatInterface showMessages={show} id={chatId} />
						</Provider>
					)}
				</div>
			</div>
		</div>
	);
};
