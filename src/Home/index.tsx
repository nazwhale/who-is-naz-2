import { projects } from "./projects";

const Home = () => {
  return (
    <div>
      <h2>projects</h2>
      <ul className="list-none">
        {projects.map((project) => (
          <li key={project.title}>
            <h3>
              <a href={project.link}>{project.title}</a>
            </h3>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
