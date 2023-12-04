import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import { format, parseISO } from "date-fns";

export const FOLDER_PATH_TO_BLOG_POSTS = "../blog-posts/";

export async function parseMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(markdown);
  return result.toString();
}

export function formatDateStr(date: string): string {
  return format(parseISO(date), "dd MMMM, ''yy");
}
