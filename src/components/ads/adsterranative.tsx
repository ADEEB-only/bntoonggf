import { useEffect } from "react";

export const AdsterraNative = () => {
  useEffect(() => {
    const container = document.getElementById(
      "container-c35c6f6f42ee902bbfca715ccd1d497f"
    );

    if (!container || container.hasChildNodes()) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://pl28562322.effectivegatecpm.com/c35c6f6f42ee902bbfca715ccd1d497f/invoke.js";

    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      id="container-c35c6f6f42ee902bbfca715ccd1d497f"
      className="my-6"
    />
  );
};
