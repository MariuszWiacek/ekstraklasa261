import React, { useEffect, useState } from "react";

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // 2. Check for iOS
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    // 3. Listen for the install prompt
    const handler = (e) => {
      e.preventDefault();
      console.log("✅ PWA Install Prompt Ready");
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else if (isIOS) {
      alert("Na iPhone: Kliknij 'Udostępnij' (kwadrat ze strzałką) i wybierz 'Do ekranu początkowego' 📲");
    } else {
      alert("Instalacja jest obecnie obsługiwana przez Twoją przeglądarkę. Spróbuj odświeżyć stronę lub sprawdź menu przeglądarki.");
    }
  };

  // Hide button if already installed
  if (isInstalled) return null;

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
  transition: "transform 0.2s"
};

export default InstallPWAButton;
