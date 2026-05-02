import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { formatPoemDate, loadPoems, type LoadedPoem } from "./utils";

const PoemPage = () => {
  const [poems, setPoems] = useState<LoadedPoem[]>([]);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    const loadAllPoems = async () => {
      setLoading(true);

      try {
        const loadedPoems = await loadPoems();
        setPoems(loadedPoems);
      } catch (error) {
        console.error("Error loading poems:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllPoems().catch((error) => {
      console.error("Error loading poems:", error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="h-screen" />;
  }

  if (poems.length === 0) {
    return (
      <div className="poem-shell text-start m-auto">
        <h1>poems</h1>
        <p>No poems yet.</p>
      </div>
    );
  }

  const currentPoem = slug
    ? poems.find((poem) => poem.slug === slug)
    : poems[0];

  if (!currentPoem) {
    return (
      <div className="poem-shell text-start m-auto">
        <h1>poems</h1>
        <p>That poem could not be found.</p>
        <div className="poem-actions">
          <Link className="poem-link" to="/poems">
            Latest poem
          </Link>
          <Link className="poem-link" to="/poems/all">
            View all
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = poems.findIndex((poem) => poem.slug === currentPoem.slug);
  const lastPoem = currentIndex > 0 ? poems[currentIndex - 1] : null;
  const nextPoem =
    currentIndex >= 0 && currentIndex < poems.length - 1
      ? poems[currentIndex + 1]
      : null;

  const randomOptions = poems.filter((poem) => poem.slug !== currentPoem.slug);
  const randomPoem =
    randomOptions.length > 0
      ? randomOptions[Math.floor(Math.random() * randomOptions.length)]
      : null;

  return (
    <div className="poem-shell text-start m-auto">
      <article className="markdown poem-markdown">
        <h1>{currentPoem.title}</h1>
        <p className="poem-date text-[13px] text-neutral/65 font-normal tracking-wide">
          {formatPoemDate(currentPoem.date)}
        </p>

        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]} remarkPlugins={[remarkGfm]}>
          {currentPoem.body}
        </ReactMarkdown>
      </article>

      <div className="poem-nav">
        <Link className="poem-link" to="/poems/all">
          All
        </Link>

        {lastPoem && (
          <Link className="poem-link" to={`/poems/${lastPoem.slug}`}>
            Last
          </Link>
        )}

        {nextPoem && (
          <Link className="poem-link" to={`/poems/${nextPoem.slug}`}>
            Next
          </Link>
        )}

        {randomPoem && (
          <Link className="poem-link" to={`/poems/${randomPoem.slug}`}>
            Random
          </Link>
        )}
      </div>
    </div>
  );
};

export default PoemPage;
