// Минимальный service worker — нужен, чтобы браузер считал сайт
// устанавливаемым приложением (PWA). Сеть не кэшируем, только пропускаем.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // pass-through: обработчик существует, но ничего не перехватывает
});
