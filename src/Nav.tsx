import React from "react";
import { Link, useLocation } from "react-router-dom";
import All from "./All.tsx";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav>
      <ul>
        {All.map((links) => (
          <li key={links.path} className="list-none">
            <Link
              to={links.path}
              className={`link link-hover ${
                location.pathname === links.path
                  ? "link-success"
                  : "link-primary"
              }`}
            >
              {links.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
