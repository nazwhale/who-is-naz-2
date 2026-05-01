import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';
import { FOLDER_PATH_TO_BLOG_POSTS, formatDateStr } from "./utils.tsx";
import frontMatter from "front-matter";
import { BlogPostMetadata } from "./index.tsx";
import Tag from "./Tag";

const BlogPost = () => {
  const [postContent, setPostContent] = useState("");
  const [postData, setPostData] = useState<BlogPostMetadata>();
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      // Make sure the path is relative and the markdown files are now in the src directory

      const markdownImports = import.meta.glob("../blog-posts/*.md", {
        as: "raw",
      });

      if (slug) {
        try {
          const markdownContent =
            await markdownImports[`${FOLDER_PATH_TO_BLOG_POSTS}${slug}.md`]();
          const {
            attributes,
            body,
          }: { attributes: BlogPostMetadata; body: string } =
            frontMatter(markdownContent);

          // Set the post content and title from the front matter
          setPostContent(body);
          setPostData(attributes);
        } catch (error) {
          console.error("Error loading post:", error);
          // Handle the error accordingly
        } finally {
          setLoading(false);
        }
      }
    };
    loadPost();
  }, [slug]);

  if (loading) {
    return <div className="h-screen" />;
  }

  if (postData == null) {
    return null;
  }

  return (
    <div className="text-start m-auto max-w-prose">
      <article className="markdown">

        <div className="mb-6 space-y-4">

          <div className="mb-1">
            {postData?.tags && (
              <div className="flex flex-wrap gap-2">
                {postData.tags.map((tag: string, index: number) => (
                  <Tag
                    key={index}
                    tagName={tag}
                    to={`/tags/${tag}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1>{postData?.title}</h1>

            {postData?.description && (
              <p className="italic font-light text-neutral/85 text-base leading-snug">
                {postData.description}
              </p>
            )}
          </div>

          <p className="text-[13px] text-neutral/65 font-normal tracking-wide">
            {formatDateStr(postData?.date)}
          </p>
        </div>

        {/* Render the Markdown content */}
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]} remarkPlugins={[remarkGfm]}>
          {postContent}
        </ReactMarkdown>
      </article>

      <div className="my-12">
        <Link className={`link link-secondary`} to={`/articles`}>
          More →
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;
