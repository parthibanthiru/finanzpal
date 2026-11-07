// Release build config (app.json, eas.json, package.json): build profiles, version, minimal
// Android permissions, iOS export-compliance flag and the notification icon. Keeps a later edit
// from quietly breaking store builds — none of this is exercised by the screen tests.
import { describe, expect, it } from '@jest/globals';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const app = require('../app.json').expo;
const eas = require('../eas.json');
const pkg = require('../package.json');

describe('release config', () => {
  it('uses one semver version for app.json and package.json', () => {
    expect(app.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.version).toBe(app.version);
  });

  it('has development, preview and production build profiles', () => {
    const { build } = eas;
    expect(build.development.developmentClient).toBe(true);
    expect(pkg.dependencies['expo-dev-client']).toBeTruthy();
    expect(build.preview.distribution).toBe('internal');
    expect(build.preview.android.buildType).toBe('apk');
    expect(build.production.android.buildType).toBe('app-bundle');
    // build numbers (versionCode / buildNumber) are managed by EAS and bumped per store build
    expect(eas.cli.appVersionSource).toBe('remote');
    expect(build.production.autoIncrement).toBe(true);
  });

  it('points every build at the Finanzpal Supabase project with the live-data switch off', () => {
    for (const name of ['development', 'preview', 'production']) {
      const profile = eas.build[name];
      const env = { ...(profile.extends ? eas.build[profile.extends].env : {}), ...(profile.env ?? {}) };
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://xliitgcsiikzxppazbfa.supabase.co');
      expect(env.EXPO_PUBLIC_SUPABASE_ANON_KEY).toMatch(/^sb_publishable_/);
      expect(env.EXPO_PUBLIC_DATA_LIVE).toBe('0');
      // only public values belong in eas.json
      expect(JSON.stringify(env)).not.toMatch(/service_role|sb_secret_/i);
    }
  });

  it('asks Android for no extra permissions', () => {
    expect(app.android.permissions).toEqual([]);
    for (const p of ['CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'READ_CONTACTS']) {
      expect(app.android.blockedPermissions).toContain(`android.permission.${p}`);
    }
  });

  it('declares iOS export compliance (HTTPS only) and needs no usage strings', () => {
    expect(app.ios.infoPlist.ITSAppUsesNonExemptEncryption).toBe(false);
    // no camera / photos / location / contacts → no NS…UsageDescription required
    expect(Object.keys(app.ios.infoPlist).filter((k) => k.endsWith('UsageDescription'))).toEqual([]);
  });

  it('has a white 96×96 notification icon wired into expo-notifications', () => {
    const plugin = app.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-notifications');
    expect(plugin[1].icon).toBe('./assets/notification-icon.png');
    const png = fs.readFileSync(path.join(root, 'assets', 'notification-icon.png'));
    expect(png.readUInt32BE(16)).toBe(96); // width
    expect(png.readUInt32BE(20)).toBe(96); // height
    expect(png[25]).toBe(6); // colour type 6 = RGBA (transparent background)
  });

  it('references only asset files that exist', () => {
    const files = [app.icon, app.android.adaptiveIcon.foregroundImage, app.web.favicon];
    for (const p of app.plugins) if (Array.isArray(p)) for (const v of Object.values(p[1] ?? {})) {
      if (typeof v === 'string' && v.startsWith('./')) files.push(v);
    }
    for (const f of files) expect(fs.existsSync(path.join(root, f))).toBe(true);
  });
});
