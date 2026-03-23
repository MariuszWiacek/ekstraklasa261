import React, { useEffect, useState } from "react";

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const handler = (e) => {
      e.preventDefault();
      console.log("✅ Install available");
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    // Android install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User choice:", outcome);
      setDeferredPrompt(null);
    } 
    // iPhone fallback
    else if (isIOS) {
      alert("Kliknij Udostępnij → Do ekranu głównego");
    } 
    // Not ready yet
    else {
      alert("Instalacja jeszcze niedostępna — użyj aplikacji chwilę i spróbuj ponownie");
    }
  };

  return (
    <button onClick={handleClick} style={buttonStyle}>
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
  fontSize: "16px",
  display: "block"
};

export default InstallPWAButton;