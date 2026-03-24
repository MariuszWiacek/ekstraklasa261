export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/service-worker.js");
        console.log("✅ Service Worker Registered", reg);

        navigator.serviceWorker.ready.then(() => {
          console.log("✅ Service Worker Ready");
        });
      } catch (err) {
        console.log("❌ SW registration failed:", err);
      }
    });
  }
}