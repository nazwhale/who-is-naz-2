import { useEffect, useRef, useState } from "react";

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

const Home = () => {
  return (
    <div>
      <p className="text-neutral text-lg leading-relaxed">
        Musician, Edinburgh.
      </p>
      <HomeSpotlightOverlay />
    </div>
  );
};

export default Home;
