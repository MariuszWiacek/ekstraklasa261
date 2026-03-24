import React, { useEffect, useRef, useState } from "react";

const InstallPWAButton = () => {
  const deferredPromptRef = useRef(null);

  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detect if app is already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Detect iOS
    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(ios);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent automatic banner
      deferredPromptRef.current = e; // Save for later
      setCanInstall(true); // Show button
      console.log("🔥 beforeinstallprompt fired");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPromptRef.current;

    // Chrome/Android install available
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      console.log("User choice:", outcome);

      deferredPromptRef.current = null;
      setCanInstall(false);
      return;
    }

    // iOS manual install
    if (isIOS) {
      alert(
        "📲 Na iPhone:\n1. Kliknij Udostępnij (📤)\n2. Wybierz 'Do ekranu początkowego'"
      );
      return;
    }

    // Chrome blocked / uninstall case → redirect to “fresh URL” to retry install
    const newURL = window.location.origin + "/?v=2";
    alert(
      "Nie można zainstalować bezpośrednio. Kliknij OK, aby spróbować ponownie."
    );
    window.location.href = newURL;
  };

  // Hide button if app is already installed
  if (isInstalled) return null;

  // Show button if iOS or install possible
  if (!isIOS && !canInstall) return (
    <button onClick={handleInstallClick} style={buttonStyle}>
      📲 Zainstaluj aplikację
    </button>
  );

  return (
    <button onClick={handleInstallClick} style={buttonStyle}>
      {isIOS ? "📲 Dodaj do ekranu początkowego" : "📲 Zainstaluj aplikację"}
    </button>
  );
};

const buttonStyle = {
  background: "#00ff0dae",
  color: "#000",
  padding: "12px 25px",
  border: "none",
  borderRadius: "30px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

export default InstallPWAButton;