import { embed } from "ai";
import { EMBEDDING_MODEL, EMBEDDING_OPTIONS } from "../constants";

export const generateTaskEmbedding = async ({ title }: { title: string }) => {
	const value = [title].filter(Boolean).join("\n");

	const embedding = await embed({
		model: EMBEDDING_MODEL,
		value,
		providerOptions: EMBEDDING_OPTIONS,
	});

	return {
		embedding: embedding.embedding,
		model: EMBEDDING_MODEL,
	};
};
