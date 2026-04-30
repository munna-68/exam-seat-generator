import { useEffect, useState } from "react";

const DOT_STATES = ["", ".", "..", "..."];

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isTextFading, setIsTextFading] = useState(false);
  const [areSlicesSliding, setAreSlicesSliding] = useState(false);
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const timers = [];
    const dotTimer = window.setInterval(() => {
      setDotIndex((current) => (current + 1) % DOT_STATES.length);
    }, 375);

    timers.push(
      window.setTimeout(() => {
        setIsTextFading(true);

        timers.push(
          window.setTimeout(() => {
            setAreSlicesSliding(true);

            timers.push(
              window.setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = previousBodyOverflow;
                document.documentElement.style.overflow = previousHtmlOverflow;
              }, 1600),
            );
          }, 400),
        );
      }, 1800),
    );

    return () => {
      window.clearInterval(dotTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="preloader-root" aria-hidden="true">
      <div id="preloader-slices">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`slice ${areSlicesSliding ? "slide-up" : ""}`}
            style={{
              transitionDelay: areSlicesSliding ? `${index * 60}ms` : "0ms",
            }}
          />
        ))}
      </div>

      <div
        id="loading-text-container"
        className={isTextFading ? "fade-out" : ""}
      >
        <div className="loading-text">
          Loading<span className="loading-dots">{DOT_STATES[dotIndex]}</span>
        </div>
      </div>
    </div>
  );
}
