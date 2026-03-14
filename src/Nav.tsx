import React from "react";
import { Link, useLocation } from "react-router-dom";
import All from "./All.tsx";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="mb-4">
      <ul className="flex gap-6 list-none p-0 justify-end">
        {All.map((links) => (
          <li key={links.path}>
            {"external" in links && links.external ? (
              <a
                href={links.path}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link link link-hover"
              >
                {links.name}
              </a>
            ) : (
              <Link
                to={links.path}
                className={`nav-link link link-hover ${location.pathname === links.path ? "active-nav" : ""
                  }`}
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
