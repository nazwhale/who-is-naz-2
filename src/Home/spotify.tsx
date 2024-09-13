const SpotifyEmbed = () => {
  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden", // To ensure rounded corners work properly
      }}
    >
      <iframe
        src="https://open.spotify.com/embed/track/7p3O4oXZuGedOijc8b2lsF?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: "12px" }}
      ></iframe>
    </div>
  );
};

export default SpotifyEmbed;
