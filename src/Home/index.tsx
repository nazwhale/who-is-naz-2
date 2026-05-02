import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import SpotifyEmbed from "./spotify.tsx";

const SPOTLIGHT_SIZE = 200;
const SPOTIFY_REVEAL_PADDING = 24;
const SPOTIFY_REVEAL_RADIUS = 24;

interface RevealBounds {
  height: number;
  left: number;
  top: number;
  width: number;
}

// The Spotify embed is a cross-origin iframe, so once the pointer enters it we
// cannot keep tracking cursor movement from the parent page. We work around
// that by revealing a larger fixed window around the whole card instead.
const getSpotifyRevealBounds = (element: HTMLDivElement): RevealBounds => {
  const rect = element.getBoundingClientRect();
  const left = Math.max(rect.left - SPOTIFY_REVEAL_PADDING, 0);
  const top = Math.max(rect.top - SPOTIFY_REVEAL_PADDING, 0);

  return {
    left,
    top,
    width: Math.max(
      Math.min(rect.width + SPOTIFY_REVEAL_PADDING * 2, window.innerWidth - left),
      0,
    ),
    height: Math.max(
      Math.min(
        rect.height + SPOTIFY_REVEAL_PADDING * 2,
        window.innerHeight - top,
      ),
      0,
    ),
  };
};

const HomeSpotlightOverlay = ({
  spotifyRevealBounds,
}: {
  spotifyRevealBounds: RevealBounds | null;
}) => {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const cursorPositionRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const circle = circleRef.current;

    if (!circle) {
      return;
    }

    // Update SVG attributes directly so the spotlight follows the pointer
    // without forcing React renders on every mouse movement.
    const updateCirclePosition = (x: number, y: number) => {
      cursorPositionRef.current = { x, y };
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
          {/* White keeps the orange veil visible; black punches holes through it. */}
          <mask id="home-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {/* Keep the circle mounted and collapse its radius while Spotify is
                active so it resumes from the right place when the pointer leaves
                the iframe, instead of jumping back to the SVG origin. */}
            <circle
              ref={circleRef}
              r={spotifyRevealBounds ? 0 : SPOTLIGHT_SIZE / 2}
              fill="black"
            />
            {spotifyRevealBounds ? (
              <rect
                x={spotifyRevealBounds.left}
                y={spotifyRevealBounds.top}
                width={spotifyRevealBounds.width}
                height={spotifyRevealBounds.height}
                rx={SPOTIFY_REVEAL_RADIUS}
                ry={SPOTIFY_REVEAL_RADIUS}
                fill="black"
              />
            ) : null}
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

const Home = () => {
  const spotifyRevealRef = useRef<HTMLDivElement | null>(null);
  const [spotifyRevealBounds, setSpotifyRevealBounds] =
    useState<RevealBounds | null>(null);

  useEffect(() => {
    if (!spotifyRevealBounds) {
      return;
    }

    // If the page scrolls or resizes while the Spotify reveal is open, keep the
    // carved-out rectangle aligned with the card's screen position.
    const updateBounds = () => {
      const element = spotifyRevealRef.current;

      if (!element) {
        return;
      }

      setSpotifyRevealBounds(getSpotifyRevealBounds(element));
    };

    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds, true);

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds, true);
    };
  }, [spotifyRevealBounds]);

  const showSpotifyReveal = () => {
    const element = spotifyRevealRef.current;

    if (!element) {
      return;
    }

    setSpotifyRevealBounds(getSpotifyRevealBounds(element));
  };

  const hideSpotifyReveal = (event: ReactPointerEvent<HTMLDivElement>) => {
    const circle = document.querySelector(
      ".home-spotlight-overlay circle",
    ) as SVGCircleElement | null;

    // Seed the circle with the pointer exit position before we re-enable it.
    if (circle) {
      circle.setAttribute("cx", `${event.clientX}`);
      circle.setAttribute("cy", `${event.clientY}`);
    }

    setSpotifyRevealBounds(null);
  };

  return (
    <div>
      <p className="text-neutral text-lg leading-relaxed">
        Musician, Edinburgh.
      </p>
      <div
        ref={spotifyRevealRef}
        className="mt-6"
        onPointerEnter={showSpotifyReveal}
        onPointerLeave={hideSpotifyReveal}
      >
        <SpotifyEmbed />
      </div>
      <HomeSpotlightOverlay spotifyRevealBounds={spotifyRevealBounds} />
    </div>
  );
};

export default Home;
