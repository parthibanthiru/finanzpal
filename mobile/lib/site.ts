import * as WebBrowser from 'expo-web-browser';

// Base URL of the website. Switch to https://finanzpal.de once the custom domain is connected in Netlify.
// While the Netlify site is still behind the SSO gate, these pages only load for logged-in team members.
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://finanzpal.netlify.app').replace(/\/$/, '');

export function siteUrl(path: string) {
  return `${SITE_URL}/${path.replace(/^\//, '')}`;
}

/** Opens a website page in the in-app browser. */
export function openSite(path: string) {
  return WebBrowser.openBrowserAsync(siteUrl(path));
}

/** Opens an external (affiliate) link. Placeholder links ("#", empty) are never opened. */
export function isRealLink(url?: string | null): url is string {
  return !!url && url !== '#' && /^https?:\/\//.test(url);
}
