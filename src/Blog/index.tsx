import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDateStr } from "./utils.tsx";
import frontMatter from "front-matter";
import Tag from "./Tag";

export interface BlogPostMetadata {
  title: string;
  date: string;
  slug: string;
  description?: string;
  tags?: string[];
}

interface BlogPost {
  metadata: BlogPostMetadata;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { tag } = useParams();

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
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
          const tags = attributes.tags || [];

          return {
            metadata: {
              title,
              date,
              slug,
              description,
              tags,
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

      // Collect all unique tags
      const tagsSet = new Set<string>();
      loadedPosts.forEach(post => {
        if (post.metadata.tags) {
          post.metadata.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      const uniqueTags = Array.from(tagsSet).sort();
      setAllTags(uniqueTags);

      // Filter posts by tag if a tag parameter is provided
      const filteredPosts = tag
        ? loadedPosts.filter(post =>
          post.metadata.tags && post.metadata.tags.includes(tag)
        )
        : loadedPosts;

      setPosts(filteredPosts);
      setLoading(false);
    };

    loadPosts().catch((error) => {
      console.error("Error loading posts:", error);
      setLoading(false);
    });
  }, [tag]);

  return (
    <div>
      <h2>{tag ? `articles tagged #${tag}` : 'articles'}</h2>

      {/* Tag list section - only show when not filtering by a specific tag */}
      {!tag && allTags.length > 0 && (
        <div className="my-4 pb-6 border-b border-secondary/20">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tagName) => (
              <Tag
                key={tagName}
                tagName={tagName}
                to={`/tags/${tagName}`}
              />
            ))}
          </div>
        </div>
      )}

      {tag && (
        <div className="mb-4">
          <Link to="/articles" className="text-sm text-secondary/70 hover:text-secondary">
            ← Back to all articles
          </Link>
        </div>
      )}
      {loading ? (
        <div className="h-screen opacity-0 animate-[fadeIn_2.5s_ease-out_forwards] text-slate-500">
          loading...
        </div>
      ) : posts.length === 0 ? (
        <p>No articles found{tag ? ` with tag #${tag}` : ''}.</p>
      ) : (
        <ul className="list-none">
          {posts.map((post, index) => (
            <li key={index} className="space-y-1">
              <h3 className="mb-0">
                <Link to={`/articles/${post.metadata.slug}`}>
                  {post.metadata.title}
                </Link>
              </h3>

              <p className="italic font-light text-secondary/80 text-base leading-snug font-['Fraunces']">
                {post.metadata.description}
              </p>

              {post.metadata.tags && post.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.metadata.tags.map((postTag, i) => (
                    <Tag
                      key={i}
                      tagName={postTag}
                      to={`/tags/${postTag}`}
                    />
                  ))}
                </div>
              )}

              <p className="text-secondary/60 tracking-wide text-sm">
                {formatDateStr(post.metadata.date)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Blog;
