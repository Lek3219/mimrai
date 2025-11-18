import { chatTitleArtifact } from "@api/ai/artifacts/chat-title";
import { setContext } from "@api/ai/context";
import { generateSystemPrompt } from "@api/ai/generate-system-prompt";
import {
	extractTextContent,
	generateTitle,
	hasEnoughContent,
} from "@api/ai/generate-title";
import { createToolRegistry } from "@api/ai/tool-types";
import type { ChatMessageMetadata } from "@api/ai/types";
import { formatToolCallTitle } from "@api/ai/utils/format-tool-call-title";
import { getUserContext } from "@api/ai/utils/get-user-context";
import type { Context } from "@api/rest/types";
import { chatRequestSchema } from "@api/schemas/chat";
import { shouldForceStop } from "@api/utils/streaming-utils";
import { db } from "@db/index";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
	getChatById,
	saveChat,
	saveChatMessage,
} from "@mimir/db/queries/chats";
import { logger } from "@mimir/logger";
import {
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
	smoothStream,
	stepCountIs,
	streamText,
	validateUIMessages,
} from "ai";

const app = new OpenAPIHono<Context>();

const MAX_MESSAGES_IN_CONTEXT = 20;

app.post("/", async (c) => {
	const body = await c.req.json();
	const validationresult = chatRequestSchema.safeParse(body);

	if (!validationresult.success) {
		return c.json({ success: false, error: validationresult.error }, 400);
	}

	const { message, id, country, timezone, city } = validationresult.data;
	const session = c.get("session");
	const teamId = c.get("teamId");

	const userId = session.userId;

	const [userContext, previousMessages] = await Promise.all([
		getUserContext({
			userId,
			teamId,
			country,
			city,
			timezone,
		}),
		getChatById(id, teamId),
	]);

	const messageMetadata = message.metadata as ChatMessageMetadata;
	const isToolCallMessage = messageMetadata?.toolCall;
	const isWebSearchMessage = messageMetadata?.webSearch;

	const previousMessagesList = previousMessages?.messages || [];
	const allMessagesForValidation = [...previousMessagesList, message];

	let validatedMessages: typeof allMessagesForValidation;
	validatedMessages = await validateUIMessages({
		messages: allMessagesForValidation,
	});

	const originalMessages = validatedMessages.slice(-MAX_MESSAGES_IN_CONTEXT);

	const needsTitle = !previousMessages?.title;

	let generatedTitle: string | null = null;
	const allMessages = [...(previousMessages?.messages || []), message];
	const shouldGenerateTitle = needsTitle && hasEnoughContent(allMessages);

	if (shouldGenerateTitle) {
		try {
			let messageContent: string;

			if (isToolCallMessage) {
				const { toolName } = messageMetadata.toolCall!;
				// Generate a descriptive title for tool calls using registry metadata
				messageContent = formatToolCallTitle(toolName);
			} else {
				// Use combined text from all messages for better context
				messageContent = extractTextContent(allMessages);
			}

			generatedTitle = await generateTitle({
				message: messageContent,
				teamName: userContext.teamName,
				fullName: userContext.fullName,
				country: userContext.country,
				city: userContext.city,
				timezone: userContext.timezone,
			});

			logger.info({
				msg: "Chat title generated",
				chatId: id,
				title: generatedTitle,
				userId,
				teamId,
			});
		} catch (error) {
			logger.error({
				msg: "Failed to generate chat title",
				chatId: id,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	return createUIMessageStreamResponse({
		stream: createUIMessageStream({
			originalMessages,
			onFinish: async ({ isContinuation, responseMessage }) => {
				if (isContinuation) {
					// If this is a continuation, save/update the chat with title if generated
					await saveChat({
						chatId: id,
						teamId,
						userId,
						title: generatedTitle,
					});

					// Only save the new AI response message
					await saveChatMessage({
						chatId: id,
						teamId,
						userId,
						message: responseMessage,
					});
				} else {
					// If this is a new conversation, create the chat with title if generated
					await saveChat({
						chatId: id,
						teamId,
						userId,
						title: generatedTitle, // Generate title if first message has enough content
					});

					// Save user message
					const userMessage = originalMessages[originalMessages.length - 1];
					if (userMessage) {
						await saveChatMessage({
							chatId: id,
							teamId,
							userId,
							message: userMessage,
						});
					}

					await saveChatMessage({
						chatId: id,
						teamId,
						userId,
						message: responseMessage,
					});
				}
			},
			execute: ({ writer }) => {
				setContext({
					db,
					user: userContext,
					writer,
					artifactSupport: true,
				});

				// Generate chat title artifact if we have a title
				if (generatedTitle) {
					const titleStream = chatTitleArtifact.stream({
						title: generatedTitle,
					});

					titleStream.complete();
				}

				const result = streamText({
					model: "openai/gpt-4o",
					system: generateSystemPrompt(
						userContext,
						isToolCallMessage,
						isWebSearchMessage,
					),
					messages: convertToModelMessages(originalMessages),
					temperature: 0.7,
					stopWhen: (step) => {
						// Stop if we've reached 10 steps (original condition)
						if (stepCountIs(10)(step)) {
							return true;
						}

						// Force stop if any tool has completed its full streaming response
						return shouldForceStop(step);
					},
					experimental_transform: smoothStream({ chunking: "word" }),
					tools: createToolRegistry(),
					onError: (error) => {
						console.error(error);
						logger.error({
							msg: "Error communicating with AI",
							userId,
							teamId,
							chatId: id,
							error:
								error instanceof Error
									? error.message
									: String(JSON.stringify(error)),
						});
					},
				});

				result.consumeStream();

				writer.merge(
					result.toUIMessageStream({
						sendStart: false,
						sendSources: true,
						sendReasoning: true,
					}),
				);
			},
		}),
	});
});

export { app as chatRouter };
