import { useState, type CSSProperties } from "react";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Navigation from "./Nav";
import routes from "./routes.tsx";

type BlobTone = "orange" | "blue" | "grey";

interface BlobConfig {
  id: string;
  tone: BlobTone;
  width: string;
  height: string;
  left: string;
  top: string;
  opacity: number;
  duration: string;
  delay: string;
  rotation: string;
  radiusStart: string;
  radiusEnd: string;
}

const blobTones: BlobTone[] = ["orange", "blue", "grey"];

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomRadius = () =>
  `${randomBetween(38, 66).toFixed(0)}% ${randomBetween(34, 62).toFixed(0)}% ${randomBetween(40, 68).toFixed(0)}% ${randomBetween(32, 60).toFixed(0)}% / ${randomBetween(36, 64).toFixed(0)}% ${randomBetween(34, 62).toFixed(0)}% ${randomBetween(38, 66).toFixed(0)}% ${randomBetween(32, 60).toFixed(0)}%`;

const shuffled = <T,>(items: T[]) =>
  [...items].sort(() => Math.random() - 0.5);

const buildBlobConfigs = (): BlobConfig[] =>
  shuffled([
    { leftBand: 4, topBand: 8 },
    { leftBand: 28, topBand: 18 },
    { leftBand: 54, topBand: 30 },
    { leftBand: 76, topBand: 10 },
    { leftBand: 14, topBand: 44 },
    { leftBand: 42, topBand: 56 },
    { leftBand: 70, topBand: 66 },
    { leftBand: 86, topBand: 48 },
  ]).map((bands, index) => {
    const width = randomBetween(7.25, 27.6);
    const height = width * randomBetween(0.42, 0.68);

    return {
      id: `blob-${index}`,
      tone: blobTones[index % blobTones.length],
      width: `${width.toFixed(1)}rem`,
      height: `${height.toFixed(1)}rem`,
      left: `${(bands.leftBand + randomBetween(-6, 6)).toFixed(1)}%`,
      top: `${(bands.topBand + randomBetween(-6, 6)).toFixed(1)}%`,
      opacity: Number(randomBetween(0.76, 0.96).toFixed(2)),
      duration: `${randomBetween(8.5, 14).toFixed(1)}s`,
      delay: `${(-randomBetween(0, 7)).toFixed(1)}s`,
      rotation: `${randomBetween(-18, 18).toFixed(1)}deg`,
      radiusStart: randomRadius(),
      radiusEnd: randomRadius(),
    };
  });

const AppShell = () => {
  const [blobs, setBlobs] = useState(buildBlobConfigs);
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";
  const isInvoiceRoute = location.pathname === "/invoice";
  const hideSiteChrome = isAdminRoute || isInvoiceRoute;

  return (
    <>
      {!hideSiteChrome && (
        <div className="mb-5">
          <div className="header-brand">
            <button
              className="header-mark-button"
              type="button"
              onClick={() => setBlobs(buildBlobConfigs())}
              aria-label="Shuffle blobs"
            >
              <img
                className="header-mark"
                src="/waveyguy.jpg"
                alt=""
                aria-hidden="true"
              />
            </button>
            <Link className="site-title-link" to="/">
              <h1 className="site-title text-[1.65rem] font-semibold sm:text-[2.05rem]">
                <span className="site-title-who">who</span>{" "}
                <span className="site-title-is">is</span>{" "}
                <span className="site-title-naz">naz</span>
              </h1>
            </Link>
          </div>
          <Navigation />
        </div>
      )}

      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>

      {!hideSiteChrome && (
        <div className="footer-area">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 mb-12 text-sm text-neutral">
            <a
              href="https://www.instagram.com/whoisnaz.music/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Insta
            </a>
            <div className="hidden sm:block">•</div>
            <a
              href="mailto:naz@whoisnaz.com"
            >
              Email: naz at whoisnaz.com
            </a>
          </div>

          <div className="blob-field" aria-hidden="true">
            {blobs.map((blob) => (
              <div
                key={blob.id}
                className={`blob blob-${blob.tone}`}
                style={{
                  width: blob.width,
                  height: blob.height,
                  left: blob.left,
                  top: blob.top,
                  opacity: blob.opacity,
                  animationDuration: blob.duration,
                  animationDelay: blob.delay,
                  "--blob-rotate": blob.rotation,
                  "--blob-radius-start": blob.radiusStart,
                  "--blob-radius-end": blob.radiusEnd,
                } as CSSProperties}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
