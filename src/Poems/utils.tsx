import frontMatter from "front-matter";
import { format, parseISO } from "date-fns";

export interface PoemMetadata {
  title: string;
  date: string;
}

export interface LoadedPoem {
  slug: string;
  title: string;
  date: string;
  body: string;
}

export const FOLDER_PATH_TO_POEMS = "../Poems/";

export function formatPoemDate(date: string): string {
  return format(parseISO(date), "dd MMMM ''yy");
}

export async function loadPoems(): Promise<LoadedPoem[]> {
  const markdownImports = import.meta.glob("../Poems/*.md", {
    as: "raw",
  });

  const markdownPromises = Object.entries(markdownImports).map(
    async ([filePath, resolver]) => {
      const markdownContent = await resolver();
      const {
        attributes,
        body,
      }: { attributes: PoemMetadata; body: string } = frontMatter(markdownContent);

      return {
        slug: filePath.split("/").pop()?.split(".")[0] || "",
        title: attributes.title || "Untitled",
        date: attributes.date || "",
        body,
      };
    },
  );

  const poems = await Promise.all(markdownPromises);

  return poems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
