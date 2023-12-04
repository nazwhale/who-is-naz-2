import React from "react";
import { Link, useLocation } from "react-router-dom";
import All from "./Metronomes/All";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav>
      <ul className="flex justify-center space-x-4">
        {All.map((metronome) => (
          <li key={metronome.path} className="list-none">
            <Link
              to={metronome.path}
              className={`link link-hover ${
                location.pathname === metronome.path
                  ? "link-success"
                  : "link-primary"
              }`}
            >
              {metronome.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
