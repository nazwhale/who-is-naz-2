import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import { FOLDER_PATH_TO_BLOG_POSTS, formatDateStr } from "./utils.tsx";
import frontMatter from "front-matter";
import { BlogPostMetadata } from "./index.tsx";

const BlogPost = () => {
  const [postContent, setPostContent] = useState("");
  const [postData, setPostData] = useState<BlogPostMetadata>();
  const { slug } = useParams();

  useEffect(() => {
    const loadPost = async () => {
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
        }
      }
    };
    loadPost();
  }, [slug]);

  if (postData == null) {
    return null;
  }

  return (
    <div className="text-start m-auto max-w-xl">
      <article className="markdown">

        <div className="mb-6 space-y-1">
          <h1 className="mb-1">{postData?.title}</h1>

          {postData?.description && (
            <p className="italic font-light text-slate-500 text-base leading-snug font-['Fraunces']">
              {postData.description}
            </p>
          )}

          <p className="text-[13px] text-slate-400 font-normal tracking-wide">
            {formatDateStr(postData?.date)}
          </p>
        </div>

        {/* Render the Markdown content */}
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
          {postContent}
        </ReactMarkdown>
      </article>

      <div className="my-12">
        <Link className={`link link-neutral`} to={`/articles`}>
          More →
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;
