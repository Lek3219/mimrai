export const EMBEDDING_MODEL = "google/gemini-embedding-001" as const;
export const DIMENSIONS = 768 as const;

export const EMBEDDING_OPTIONS = {
	google: {
		outputDimensionality: 768,
		taskType: "SEMANTIC_SIMILARITY",
	},
};
