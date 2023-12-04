import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDateStr } from "./utils.tsx";
import frontMatter from "front-matter";

export interface BlogPostMetadata {
  title: string;
  slug: string;
  date: string;
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
        async ([, resolver]) => {
          const markdownContent = await resolver();

          const { attributes }: { attributes: BlogPostMetadata } =
            frontMatter(markdownContent);

          // Extract the slug and title from the front matter
          const slug = attributes.slug;
          const title = attributes.title || "No Title";
          const date = attributes.date || "No Date";

          return {
            metadata: {
              title,
              slug,
              date,
            },
          };
        },
      );

      const loadedPosts: BlogPost[] = await Promise.all(markdownPromises);
      setPosts(loadedPosts);
    };

    loadPosts();
  }, []);

  console.log("posts", posts);

  return (
    <div>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <Link
              className={`link link-neutral`}
              to={`/articles/${post.metadata.slug}`}
            >
              {post.metadata.title}
            </Link>
            <span className="text-secondary-content/50">
              {" "}
              • {formatDateStr(post.metadata.date)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Blog;
