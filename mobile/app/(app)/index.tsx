import { Redirect } from 'expo-router';

// After login the app opens on the comparisons (like the website's start page).
export default function Home() {
  return <Redirect href="/vergleiche" />;
}
