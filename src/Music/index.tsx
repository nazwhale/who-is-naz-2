import SpotifyEmbed from "../Home/spotify.tsx";

const Music = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2>Demos</h2>
        <div className="music-embed-card">
          <iframe
            src="https://samply.app/embed/PRViDOuOD7WguuC4ps3D?si=KCEtB3YF2qT0agqCnDb8aJK94622"
            title="Naz Samply demos"
            frameBorder="0"
            allowTransparency={true}
            height="245px"
            className="music-embed-frame"
          />
        </div>
      </section>

      <section>
        <h2>Spotify</h2>
        <SpotifyEmbed />
      </section>

      <section>
        <h2>Other Links</h2>
        <div>
          <a
            href="https://whoisnaz.bandcamp.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bandcamp - released music and a way to support me
          </a>
        </div>
        <div>
          <a
            href="https://soundcloud.com/nazmalik-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Soundcloud - old demos from way back
          </a>
        </div>
      </section>
    </div>
  );
};

export default Music;
