import React, { useEffect, useState } from "react";

const InstallPWAButton = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(ios);

    // Check global event
    if (window.deferredPrompt) {
      setCanInstall(true);
    }

    // Fallback listener
    const handler = (e) => {
      e.preventDefault();
      console.log("🔥 REACT EVENT FIRED");
      window.deferredPrompt = e;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    const promptEvent = window.deferredPrompt;

    console.log("Prompt object:", promptEvent);

    if (promptEvent) {
      promptEvent.prompt();

      const { outcome } = await promptEvent.userChoice;
      console.log("User choice:", outcome);

      window.deferredPrompt = null;
      setCanInstall(false);
    } else if (isIOS) {
      alert(
        "Na iPhone: Kliknij 'Udostępnij' i wybierz 'Dodaj do ekranu początkowego' 📲"
      );
    } else {
      alert("Instalacja chwilowo niedostępna");
    }
  };

  if (isInstalled) return null;

  return (
  <button
    onClick={handleClick}
    style={{
      ...buttonStyle,
      opacity: canInstall ? 1 : 0.5,
      cursor: canInstall ? "pointer" : "not-allowed",
    }}
    disabled={!canInstall}
  >
    {canInstall
      ? "📲 Zainstaluj apkę"
      : "📲 Apka chwilowo niedostępna"}
  </button>
);
};

const buttonStyle = {
  background: "#00ff0d",
  color: "#000",
  padding: "12px 25px",
  border: "none",
  borderRadius: "30px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

export default InstallPWAButton;