"use client";

import "./styles.css";

import {
	EditorContent,
	type Editor as EditorInstance,
	type JSONContent,
	useEditor,
} from "@tiptap/react";
import { BubbleMenu } from "./extentions/bubble-menu";
import { registerExtensions } from "./extentions/register";

type EditorProps = {
	value?: string;
	placeholder?: string;
	onUpdate?: (editor: EditorInstance) => void;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	onFocus?: () => void;
	className?: string;
	tabIndex?: number;
};

export function Editor({
	value,
	placeholder,
	onUpdate,
	onChange,
	onBlur,
	onFocus,
	className,
	tabIndex,
}: EditorProps) {
	const editor = useEditor({
		extensions: registerExtensions({ placeholder }),
		content: value,
		immediatelyRender: false,
		onBlur,
		onFocus,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
			onUpdate?.(editor);
		},
	});

	if (!editor) return null;

	return (
		<>
			<EditorContent
				editor={editor}
				className={className}
				tabIndex={tabIndex}
			/>
			<BubbleMenu editor={editor} />
		</>
	);
}
