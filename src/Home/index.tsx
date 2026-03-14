const Home = () => {
  return (
    <div>
      <p className="text-primary font-['Fraunces'] text-lg leading-relaxed">
        musician based in Edinburgh.
      </p>
      <div className="mt-6">
        <iframe
          style={{ border: 0, width: "100%", height: 120 }}
          src="https://bandcamp.com/EmbeddedPlayer/track=2932018670/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/transparent=true/"
          seamless
          title="transport by naz"
        >
          <a href="https://whoisnaz.bandcamp.com/track/transport">transport by naz</a>
        </iframe>
      </div>
    </div>
  );
};

export default Home;
