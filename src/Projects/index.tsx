import { projects } from "../Home/projects";

const Projects = () => {
  return (
    <div>
      <ul className="project-grid list-none">
        {projects.filter((project) => !project.archived).map((project) => (
          <li key={project.title} className="project-card">
            <a
              className="project-card-link no-underline hover:no-underline"
              href={project.link}
            >
              <h3 className="project-card-title mb-0 mt-0">
                {project.title}
              </h3>
              <p className="project-card-description italic font-light text-neutral/85 text-base leading-snug">
                {project.description}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
