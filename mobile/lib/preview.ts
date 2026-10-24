// Preview mode ("Vorschau ohne Konto"): built with EXPO_PUBLIC_PREVIEW=1, e.g. the web preview from
// .github/workflows/mobile-web-preview.yml. The app opens straight into the comparisons with a demo
// user; nothing talks to Supabase. Merkliste and settings stay on this device/browser, the chat and
// account actions say they need the real app.
import type { Session } from '@supabase/supabase-js';

export const PREVIEW = process.env.EXPO_PUBLIC_PREVIEW === '1';

export const PREVIEW_SESSION = {
  access_token: 'preview',
  refresh_token: 'preview',
  token_type: 'bearer',
  expires_in: 0,
  user: {
    id: 'preview',
    email: 'vorschau@finanzpal.de',
    created_at: '2026-10-25T00:00:00Z',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: '' },
  },
} as unknown as Session;
