// You can find the list of extensions here: https://tiptap.dev/docs/editor/extensions/functionality

import { getApiUrl } from "@mimir/utils/envs";
import CodeBlock from "@tiptap/extension-code-block";
import FileHandler from "@tiptap/extension-file-handler";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

// Add your extensions here
const extensions = ({
  onUpload,
  shouldInsertImage,
}: {
  onUpload?: (fileUrl: string) => Promise<void>;
  shouldInsertImage?: boolean;
}) => [
  StarterKit,
  Underline,
  Image,
  CodeBlock,
  Markdown,
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),

  FileHandler.configure({
    onDrop: async (currentEditor, files, pos) => {
      const fileReader = new FileReader();
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${getApiUrl()}/api/attachments/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await response.json();
        const url = data.url as string;

        if (shouldInsertImage) {
          currentEditor
            .chain()
            .insertContentAt(pos, {
              type: "image",
              attrs: {
                src: url,
              },
            })
            .focus()
            .run();
        }

        onUpload?.(url);
        // fileReader.readAsDataURL(file);
        // fileReader.onload = () => {
        //   currentEditor
        //     .chain()
        //     .insertContentAt(pos, {
        //       type: "image",
        //       attrs: {
        //         src: fileReader.result,
        //       },
        //     })
        //     .focus()
        //     .run();
        // };
      }
    },
    onPaste: async (currentEditor, files, htmlContent) => {
      for (const file of files) {
        if (htmlContent) {
          // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
          // you could extract the pasted file from this url string and upload it to a server for example
          console.log(htmlContent); // eslint-disable-line no-console
          return false;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${getApiUrl()}/api/attachments/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await response.json();
        const url = data.url as string;

        console.log("Uploaded file data:", data);

        if (shouldInsertImage) {
          currentEditor
            .chain()
            .insertContentAt(currentEditor.state.selection.anchor, {
              type: "image",
              attrs: {
                src: url,
              },
            })
            .focus()
            .run();
        }

        onUpload?.(url);

        // const fileReader = new FileReader();

        // fileReader.readAsDataURL(file);
        // fileReader.onload = () => {
        //   currentEditor
        //     .chain()
        //     .insertContentAt(currentEditor.state.selection.anchor, {
        //       type: "image",
        //       attrs: {
        //         src: fileReader.result,
        //       },
        //     })
        //     .focus()
        //     .run();
        // };
      }
    },
  }),
];

export function registerExtensions(options?: {
  placeholder?: string;
  onUpload?: (fileUrl: string) => Promise<void>;
  shouldInsertImage?: boolean;
}) {
  const { placeholder, onUpload, shouldInsertImage } = options ?? {};
  return [
    ...extensions({ onUpload, shouldInsertImage }),
    Placeholder.configure({ placeholder }),
  ];
}
