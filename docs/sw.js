const staticLabel = 'site-static'
const staticAssets = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  'https://fonts.googleapis.com/css?family=Jaldi|Open+Sans&display=swap',
  'https://fonts.gstatic.com/s/jaldi/v6/or3sQ67z0_CI33NTbJHdBLg9.woff2',
  'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFW50bf8pkAp6a.woff2',
  '/manifest.json',
  '/assets/icons/16x16.png',
  '/assets/icons/32x32.png',
  '/assets/icons/72x72.png',
  '/assets/icons/96x96.png',
  '/assets/icons/128x128.png',
  '/assets/icons/144x144.png',
  '/assets/icons/152x152.png',
  '/assets/icons/192x192.png',
  '/assets/icons/384x384.png',
  '/assets/icons/512x512.png'
]

const conversionLabel = 'conversions'
const conversionApi = 'api.exchangeratesapi.io'

self.addEventListener('install', e => {
  // console.log('installed', e);
  e.waitUntil(
    caches.open(staticLabel).then(cache => cache.addAll(staticAssets))
  )
})

self.addEventListener('activate', e => {
  // console.log('activated', e);
  e.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== staticLabel && key !== conversionLabel)
            .map(key => caches.delete(key))
        )
      )
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cacheRes => {
      if (cacheRes) {
        return cacheRes
      }
      return fetch(e.request)
        .then(res => {
          if (!res || res.status !== 200) return res
          if (new URL(res.url).hostname === conversionApi) {
            const resClone = res.clone()
            caches
              .open(conversionLabel)
              .then(cache => cache.put(e.request, resClone))
          }
          return res
        })
        .catch(err => {
          const init = {
            status: 503,
            statusText: 'Offline'
          }
          return new Response(JSON.stringify(err), init)
        })
    })
  )
})
