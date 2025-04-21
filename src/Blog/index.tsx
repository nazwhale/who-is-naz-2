import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDateStr } from "./utils.tsx";
import frontMatter from "front-matter";

export interface BlogPostMetadata {
  title: string;
  date: string;
  slug: string;
  description?: string;
}

interface BlogPost {
  metadata: BlogPostMetadata;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      // Dynamically import all .md files from the blog-posts directory
      const markdownImports = import.meta.glob("..//blog-posts/*.md", {
        as: "raw",
      });

      const markdownPromises = Object.entries(markdownImports).map(
        async ([filePath, resolver]) => {
          const markdownContent = await resolver();

          const { attributes }: { attributes: BlogPostMetadata } =
            frontMatter(markdownContent);

          // get post slug from file name
          const slug = filePath.split("/").pop()?.split(".")[0] || "";

          // Extract the slug and title from the front matter
          const title = attributes.title || "No Title";
          const date = attributes.date || "No Date";
          const description = attributes.description || "";

          return {
            metadata: {
              title,
              date,
              slug,
              description,
            },
          };
        },
      );

      const loadedPosts: BlogPost[] = await Promise.all(markdownPromises);

      // order by date
      loadedPosts.sort((a, b) => {
        return (
          new Date(b.metadata.date).getTime() -
          new Date(a.metadata.date).getTime()
        );
      });

      setPosts(loadedPosts);
    };

    loadPosts().catch((error) => {
      console.error("Error loading posts:", error);
    });
  }, []);

  return (
    <div>
      <h2>articles</h2>
      <ul className="list-none">
        {posts.map((post, index) => (
          <li key={index} className="space-y-1">
            <h3 className="mb-0">
              <Link to={`/articles/${post.metadata.slug}`}>
                {post.metadata.title}
              </Link>
            </h3>

            <p className="italic font-light text-slate-500 text-base leading-snug font-['Fraunces']">
              {post.metadata.description}
            </p>

            <p className="text-secondary-content/50 tracking-wide text-sm text-slate-400">
              {formatDateStr(post.metadata.date)}
            </p>
          </li>
        ))}
      </ul>
    </div >
  );
};

export default Blog;
