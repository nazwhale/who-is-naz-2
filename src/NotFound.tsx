import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found-shell">
      <h1 className="not-found-code" aria-label="404">
        <span className="not-found-orange">4</span>
        <span className="not-found-blue">0</span>
        <span className="not-found-grey">4</span>
      </h1>

      <p className="not-found-copy">That page has wandered off.</p>

      <Link className="poem-link" to="/">
        Back home
      </Link>
    </div>
  );
};

export default NotFound;
