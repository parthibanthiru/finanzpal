// App entry. Normally just expo-router's entry; the web preview (EXPO_PUBLIC_PREVIEW=1, see
// lib/preview.ts) may be served from any folder (e.g. https://host/some/path/index.html), but
// expo-router reads the page address as the route. So the preview remembers its folder in a
// <base> tag (files keep loading from there) and starts at the app's home route "/".
if (process.env.EXPO_PUBLIC_PREVIEW === '1' && typeof document !== 'undefined') {
  try {
    const folder = window.location.pathname.replace(/[^/]*$/, '');
    if (!document.querySelector('base')) {
      const base = document.createElement('base');
      base.href = folder;
      document.head.prepend(base);
    }
    window.history.replaceState(null, '', '/' + window.location.search);
  } catch {
    // keep the address as it is
  }
}
require('expo-router/entry');
