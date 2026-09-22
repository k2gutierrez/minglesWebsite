import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page-intro">
      <span className="eyebrow">404 / A LITTLE TOO WEIRD</span>
      <h1>
        LOST IN
        <br />
        THE AGAVE?
      </h1>
      <p>This page is not part of the build.</p>
      <Link className="button button-dark" href="/">
        Back to Mingles ↗
      </Link>
    </main>
  );
}
