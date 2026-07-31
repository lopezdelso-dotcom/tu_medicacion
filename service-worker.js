importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");
importScripts("/firebase-config.js");

const FIREBASE_CONFIG = self.__FIREBASE_CONFIG__;

try {
  if (FIREBASE_CONFIG) {
    firebase.initializeApp(FIREBASE_CONFIG);
    firebase.messaging().onBackgroundMessage(payload => {
      const notification = payload.notification || {};
      const data = payload.data || {};
      self.registration.showNotification(notification.title || data.title || "Tu Medicación", {
        body: notification.body || data.body || "Tienes una toma pendiente.",
        icon: "/pwa-icons/icon-192.png",
        badge: "/pwa-icons/maskable-192.png",
        data: {url: data.url || "/"}
      });
    });
  }
} catch (error) {}

const CACHE_NAME = "tu-medicacion-pwa-v4";
const APP_SHELL = [
  "/",
  "/index.html",
  "/app.js",
  "/app-icon.png",
  "/manifest.webmanifest",
  "/styles.css",
  "/mobile.css",
  "/admin.css",
  "/supervisor.css",
  "/user-controls.css",
  "/selection-flow.css",
  "/ocr.css",
  "/medication.css",
  "/pwa-icons/icon-192.png",
  "/pwa-icons/icon-512.png",
  "/pwa-icons/maskable-192.png",
  "/pwa-icons/maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({type: "window", includeUncontrolled: true}).then(clientList => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/__/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
