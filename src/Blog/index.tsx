// blog/index.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import grayMatter from "gray-matter";
import { Buffer } from "buffer";

window.Buffer = Buffer; // Assign it to the window to make it globally available

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
      const markdownImports = import.meta.glob("/src/blog-posts/*.md", {
        as: "raw",
      });

      const markdownPromises = Object.entries(markdownImports).map(
        async ([path, resolver]) => {
          const markdownContent = await resolver();
          // Parse the front matter using gray-matter
          const matterResult = grayMatter(markdownContent);

          // Extract the slug and title from the front matter
          const slug = matterResult.data.slug;
          const title = matterResult.data.title || "No Title";
          const date = matterResult.data.date || "No Date";

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

  console.log(posts);

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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Blog;
