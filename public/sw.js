self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
self.addEventListener('fetch', (e) => {
  const url = e.request.url
  if (url.includes('supabase.co') || url.includes('/rest/') || url.includes('/auth/')) return
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request).then(r => r || fetch(e.request))))
})