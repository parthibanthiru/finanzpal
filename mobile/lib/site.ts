import * as WebBrowser from 'expo-web-browser';
import { getLang } from './i18n';

// Base URL of the website. Switch to https://finanzpal.de once the custom domain is connected.
// While the site is still behind the Netlify SSO gate, these pages only load for logged-in team members.
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://finanzpal.netlify.app').replace(/\/$/, '');

/** Website page in the current language: English pages live under en/ with the same file names. */
export function siteUrl(path: string) {
  const clean = path.replace(/^\//, '');
  return `${SITE_URL}/${getLang() === 'en' ? 'en/' : ''}${clean}`;
}

/** Opens a website page in the in-app browser. */
export function openSite(path: string) {
  return WebBrowser.openBrowserAsync(siteUrl(path));
}

/** Opens an external (affiliate) link. Placeholder links ("#", empty) are never opened. */
export function isRealLink(url?: string | null): url is string {
  return !!url && url !== '#' && /^https?:\/\//.test(url);
}
