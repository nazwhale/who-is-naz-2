const SpotifyEmbed = () => {
  return (
    <div className="music-embed-card">
      <iframe
        src="https://open.spotify.com/embed/track/7p3O4oXZuGedOijc8b2lsF?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Naz on Spotify"
        className="music-embed-frame"
      />
    </div>
  );
};

export default SpotifyEmbed;
