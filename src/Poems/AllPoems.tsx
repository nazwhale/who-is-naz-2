import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPoemDate, loadPoems, type LoadedPoem } from "./utils";

const AllPoems = () => {
  const [poems, setPoems] = useState<LoadedPoem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="poem-shell text-start m-auto">
      <h1>all poems</h1>

      <div className="poem-actions">
        <Link className="poem-link" to="/poems">
          Latest poem
        </Link>
      </div>

      {loading ? (
        <div className="h-screen" />
      ) : poems.length === 0 ? (
        <p>No poems yet.</p>
      ) : (
        <ul className="poem-list">
          {poems.map((poem) => (
            <li key={poem.slug}>
              <Link className="no-underline hover:no-underline" to={`/poems/${poem.slug}`}>
                <h2 className="poem-list-title">{poem.title}</h2>
                <p className="poem-date text-[13px] text-neutral/65 font-normal tracking-wide">
                  {formatPoemDate(poem.date)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllPoems;
