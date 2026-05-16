// Yeoun PWA 서비스 워커
// 정적 자산만 캐싱하고 API·세션 미디어·SSE 등 사용자 데이터 흐름은 그대로 통과시킨다
// (대화 메시지·음성·영상은 명세상 세션 단위로만 존재해야 하므로 절대 캐싱하지 않는다)

const CACHE_NAME = "yeoun-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = ["/", "/offline", "/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // 다른 오리진은 손대지 않는다
  if (url.origin !== self.location.origin) return;
  // API·세션 미디어·SSE·범위 요청·오디오/비디오는 SW가 우회한다
  if (url.pathname.startsWith("/api/")) return;
  if (request.headers.get("Range")) return;
  const accept = request.headers.get("Accept") || "";
  if (accept.includes("text/event-stream")) return;
  if (request.destination === "video" || request.destination === "audio")
    return;

  // 페이지 네비게이션: network-first, 실패 시 캐시 → offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // 정적 자산: cache-first, 미스 시 네트워크 + 캐시 갱신
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL));
    }),
  );
});
