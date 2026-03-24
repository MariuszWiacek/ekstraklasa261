import React, { useEffect, useState } from "react";

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(ios);

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      console.log("✅ Install prompt available");
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("✅ User installed app");
      }

      setDeferredPrompt(null);
      setCanInstall(false);
    } else if (isIOS) {
      alert(
        "Na iPhone: Kliknij 'Udostępnij' i wybierz 'Do ekranu początkowego' 📲"
      );
    } else {
      alert("Instalacja niedostępna — odśwież stronę lub użyj Chrome.");
    }
  };

  // Hide if installed OR not ready (except iOS)
  if (isInstalled || (!canInstall && !isIOS)) return null;

  return (
    <button onClick={handleClick} style={buttonStyle}>
      📲 Zainstaluj aplikację Ekstrabet
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
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

export default InstallPWAButton;