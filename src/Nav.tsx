import React from "react";
import { Link, useLocation } from "react-router-dom";
import All from "./All.tsx";

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActivePath = (path: string) =>
    path === "/"
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="mb-3">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 list-none p-0 justify-start">
        {All.map((links) => (
          <li key={links.path}>
            {"external" in links && links.external ? (
              <a
                href={links.path}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                {links.name}
              </a>
            ) : (
              <Link
                to={links.path}
                className={`nav-link ${isActivePath(links.path) ? "active-nav" : ""}`}
              >
                {links.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
