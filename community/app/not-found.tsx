import { ArrowRight } from "lucide-react";
import { CommunityChrome } from "./components/community-chrome";

export const metadata = {
  title: "Page not found | Community",
  description: "The page you were looking for could not be found.",
};

export default function NotFound() {
  return (
    <CommunityChrome>
      <section className="not-found-band section-wide">
        <div className="not-found-inner section">
          <p className="eyebrow hero-eyebrow">
            <span className="eyebrow-line" /> ERROR / 404
          </p>
          <h1>PAGE NOT<br /><em>FOUND.</em></h1>
          <p className="not-found-lede">
            The page you are looking for has moved, was removed, or never existed. Start from the home page and find your way back in.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/">
              BACK TO HOME <ArrowRight size={17} />
            </a>
            <a className="button button-primary" href="/capabilities">
              EXPLORE CAPABILITIES <ArrowRight size={17} />
            </a>
          </div>
          <div className="not-found-code" aria-hidden="true">404</div>
        </div>
      </section>
    </CommunityChrome>
  );
}
