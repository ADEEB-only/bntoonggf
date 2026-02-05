import { useEffect, useRef } from "react";

const NATIVE_CONTAINER_ID = "container-c35c6f6f42ee902bbfca715ccd1d497f";
const NATIVE_SCRIPT_SRC =
  "https://pl28562322.effectivegatecpm.com/c35c6f6f42ee902bbfca715ccd1d497f/invoke.js";

export function AdsterraNative() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.hasChildNodes()) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = NATIVE_SCRIPT_SRC;

    container.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div id={NATIVE_CONTAINER_ID} ref={containerRef} className="mb-6 flex justify-center" />;
}
