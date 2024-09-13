import { projects } from "./projects";
import SpotifyEmbed from "./spotify.tsx";

const Home = () => {
  return (
    <div>
      <h2>projects</h2>
      <ul className="list-none">
        {projects.map((project) => (
          <li key={project.title}>
            <h3>
              {/*only show link ui on hover*/}
              <a href={project.link}>{project.title}</a>
            </h3>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>

      <div className="divider"></div>

      <h2>songs</h2>
      <SpotifyEmbed />
    </div>
  );
};

export default Home;
