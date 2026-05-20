import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import frontMatter from "front-matter";
import { formatDateStr } from "../Blog/utils";
import type { BlogPostMetadata } from "../Blog";

interface StartupPost {
  metadata: BlogPostMetadata;
}

const STARTUP_SLUGS = ["startup-links", "personal-bios"];

const Startups = () => {
  const [posts, setPosts] = useState<StartupPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);

      const markdownImports = import.meta.glob("../blog-posts/*.md", {
        as: "raw",
      });

      const loadedPosts: StartupPost[] = [];

      for (const slug of STARTUP_SLUGS) {
        const filePath = `../blog-posts/${slug}.md`;
        const resolver = markdownImports[filePath];

        if (resolver == null) {
          continue;
        }

        const markdownContent = await resolver();
        const { attributes }: { attributes: BlogPostMetadata } =
          frontMatter(markdownContent);

        loadedPosts.push({
          metadata: {
            title: attributes.title || "No Title",
            date: attributes.date || "No Date",
            slug,
            description: attributes.description || "",
            tags: attributes.tags || [],
          },
        });
      }

      loadedPosts.sort(
        (a, b) =>
          STARTUP_SLUGS.indexOf(a.metadata.slug) -
          STARTUP_SLUGS.indexOf(b.metadata.slug),
      );

      setPosts(loadedPosts);
      setLoading(false);
    };

    loadPosts().catch((error) => {
      console.error("Error loading startup posts:", error);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className="page-heading">startups</h2>

      {loading ? (
        <div className="h-screen opacity-0 animate-[fadeIn_2.5s_ease-out_forwards] text-slate-500">
          loading...
        </div>
      ) : posts.length === 0 ? (
        <p>No startup articles found.</p>
      ) : (
        <ul className="article-grid list-none">
          {posts.map((post) => (
            <li key={post.metadata.slug} className="article-card">
              <Link
                className="article-card-link no-underline hover:no-underline"
                to={`/articles/${post.metadata.slug}`}
              >
                <h3 className="article-card-title mb-0 mt-0">
                  {post.metadata.title}
                </h3>

                <p className="article-card-description italic font-light text-neutral/85 text-base leading-snug">
                  {post.metadata.description}
                </p>

                <p className="article-card-date text-neutral/65 tracking-wide text-sm">
                  {formatDateStr(post.metadata.date)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Startups;
