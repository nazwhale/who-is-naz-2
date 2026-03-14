import { projects } from "../Home/projects";
import SpotifyEmbed from "../Home/spotify.tsx";

const Projects = () => {
  return (
    <div>
      <h2>projects</h2>
      <ul className="list-none">
        {projects.filter((project) => !project.archived).map((project) => (
          <li key={project.title} className="space-y-1">
            <h3>
              <a href={project.link}>{project.title}</a>
            </h3>
            <p className="italic font-light text-secondary/80 text-base leading-snug font-['Fraunces']">
              {project.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="divider"></div>

      <h2>songs</h2>
      <SpotifyEmbed />
    </div>
  );
};

export default Projects;
