const staticLabel = "site-static";
const staticAssets = [
    "/",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./script.js",
    "https://fonts.googleapis.com/css?family=Jaldi|Open+Sans&display=swap",
    "https://fonts.gstatic.com/s/jaldi/v6/or3sQ67z0_CI33NTbJHdBLg9.woff2",
    "https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0bf8pkAg.woff2"
];

self.addEventListener('install', e => {
    // console.log('installed', e);
    e.waitUntil(
        caches.open(staticLabel)
            .then(cache => cache.addAll(staticAssets))
    )
})

self.addEventListener('activate', e => {
    // console.log('activated', e);
    e.waitUntil(
        caches.keys()
            .then(keys =>
                Promise.all(keys
                    .filter(key => key !== staticLabel)
                    .map(key => caches.delete(key))))
    )
})

self.addEventListener('fetch', e => {
    // console.log('fetched', e);
    e.respondWith(
        caches.match(e.request)
            .then(cacheRes => cacheRes || fetch(e.request))
    )
})