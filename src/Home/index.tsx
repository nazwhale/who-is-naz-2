import SpotifyEmbed from "./spotify.tsx";

const Home = () => {
  return (
    <div>
      <p className="text-neutral text-lg leading-relaxed">
        Musician, Edinburgh.
      </p>
      <div className="mt-6">
        <SpotifyEmbed />
      </div>
    </div>
  );
};

export default Home;
