import React from "react";
import { Link, useLocation } from "react-router-dom";
import All from "./All.tsx";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="h-14">
      <ul>
        {All.map((links) => (
          <li key={links.path} className="list-none">
            <Link
              to={links.path}
              className={`nav-link link link-hover link-primary ${
                location.pathname === links.path ? "text-2xl" : ""
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
