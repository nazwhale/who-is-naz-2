const localMusicLinks = [
  {
    href: "https://communalleisure.com/",
    label: "Communal Leisure - edin/glas diy listings",
  },
  {
    href: "https://www.lostmap.com/",
    label: "Lost Map - cosmic-folky-indie label",
  },
  {
    href: "https://www.gloss.scot/",
    label: "GLOSS - many cool synths in a building in Glasgow",
  },
];

const LocalMusicLinks = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {localMusicLinks.map((link) => (
          <div key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalMusicLinks;
