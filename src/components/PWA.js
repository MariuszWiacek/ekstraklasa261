import React, { useEffect, useState } from "react";

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setShowIOS(true);
    }

    const handler = (e) => {
      e.preventDefault();
      console.log("✅ Install available");
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log("User choice:", outcome);
    setDeferredPrompt(null);
  };

  // iOS fallback
  if (showIOS) {
    return (
      <div style={iosStyle}>
        📲 Zainstaluj aplikację: <br />
        kliknij <strong>Udostępnij</strong> → <strong>Do ekranu głównego</strong>
      </div>
    );
  }

  // Android button
  if (!deferredPrompt) return null;

  return (
    <button onClick={handleInstallClick} style={buttonStyle}>
      📲 Zainstaluj aplikację
    </button>
  );
};

const buttonStyle = {
  background: "#00ff0d",
  color: "#000",
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  marginTop: "15px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px"
};

const iosStyle = {
  background: "#333",
  color: "#fff",
  padding: "12px",
  borderRadius: "10px",
  marginTop: "15px",
  textAlign: "center"
};

export default InstallPWAButton;