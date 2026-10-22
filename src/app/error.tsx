
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <h2>Something went wrong.</h2>
      <p>Please try again.</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
}
