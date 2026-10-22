// Drop this into your existing Finanzpal Express backend to protect /api/chat.
//
//   npm install @supabase/supabase-js
//
//   // server.js
//   const { requireUser } = require('./requireUser');
//   app.post('/api/chat', requireUser, async (req, res) => {
//     // req.user.id  -> the logged-in Supabase user
//     ...
//   });
//
// Add to the backend's .env:
//   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
//   SUPABASE_ANON_KEY=YOUR-ANON-KEY

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function requireUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  // Asks Supabase to validate the JWT; rejects expired or forged tokens.
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

  req.user = data.user;
  next();
}

module.exports = { requireUser };
