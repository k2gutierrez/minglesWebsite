"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="error-screen">
      <span className="eyebrow">A SMALL INTERRUPTION</span>
      <h2>LET’S TRY THAT AGAIN.</h2>
      <p>This page could not load. Your account has not been changed.</p>
      <button className="button button-dark" onClick={reset}>
        Reload this view ↗
      </button>
    </main>
  );
}
