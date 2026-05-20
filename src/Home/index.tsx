import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SPOTLIGHT_SIZE = 200;

const HomeSpotlightOverlay = () => {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const circle = circleRef.current;

    if (!circle) {
      return;
    }

    const updateCirclePosition = (x: number, y: number) => {
      circle.setAttribute("cx", `${x}`);
      circle.setAttribute("cy", `${y}`);
    };

    const updateCursorPosition = (event: PointerEvent) => {
      updateCirclePosition(event.clientX, event.clientY);
    };

    const updateTouchPosition = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];

      if (!touch) {
        return;
      }

      updateCirclePosition(touch.clientX, touch.clientY);
    };

    updateCirclePosition(window.innerWidth / 2, window.innerHeight / 2);
    window.addEventListener("pointerdown", updateCursorPosition);
    window.addEventListener("pointermove", updateCursorPosition);
    window.addEventListener("touchstart", updateTouchPosition, { passive: true });
    window.addEventListener("touchmove", updateTouchPosition, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", updateCursorPosition);
      window.removeEventListener("pointermove", updateCursorPosition);
      window.removeEventListener("touchstart", updateTouchPosition);
      window.removeEventListener("touchmove", updateTouchPosition);
    };
  }, []);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  return (
    <div className="home-spotlight-overlay" aria-hidden="true">
      <svg
        className="home-spotlight-overlay-svg"
        viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="home-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <circle ref={circleRef} r={SPOTLIGHT_SIZE / 2} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="#F86E5E"
          mask="url(#home-spotlight-mask)"
        />
      </svg>
    </div>
  );
};

const HOME_TREASURE_LINKS = [
  { path: "/music", name: "music" },
  { path: "/poems", name: "poems" },
  { path: "/projects", name: "projects" },
  { path: "/articles", name: "words" },
  { path: "/scotland-music-links", name: "local music links" },
];

const Home = () => {
  return (
    <div className="home-treasure-shell">
      <div className="home-copy">
        <p className="home-kicker">Musician, Edinburgh</p>
        <h2 className="home-treasure-title">wait what&apos;s going on here</h2>
      </div>

      <nav className="home-treasure-nav" aria-label="Home navigation">
        <ul className="home-treasure-grid list-none">
          {HOME_TREASURE_LINKS.map((link) => (
            <li key={link.path} className="home-treasure-item">
              <Link to={link.path} className="home-treasure-link">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <HomeSpotlightOverlay />
    </div>
  );
};

export default Home;
