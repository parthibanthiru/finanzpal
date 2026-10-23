// Lets the Finanzpal backend use the `history` the app now sends with each question,
// so the bot remembers the conversation after an app restart or a server restart.
//
// In your existing /api/chat handler, where you build the `messages` array for the
// Claude API, replace the in-memory session lookup with:
//
//   const { buildMessages } = require('./chatHistory');
//   ...
//   app.post('/api/chat', requireUser, async (req, res) => {
//     const { sessionId, message, history, language } = req.body;
//     const messages = buildMessages(sessions.get(sessionId), history, message);
//     const response = await anthropic.messages.create({
//       model, tools, messages, max_tokens,
//       system: system + languageInstruction(language),   // app in English -> answers in English
//     });
//     ...
//   });
//
// Rule: if the server still has the session in memory, that wins (it also contains tool calls).
// Otherwise the history from the app is used.

const MAX_ITEMS = 10;
const MAX_CHARS = 4000;

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  const items = history
    .filter(
      (h) =>
        h &&
        (h.role === 'user' || h.role === 'assistant') &&
        typeof h.content === 'string' &&
        h.content.trim() !== ''
    )
    .slice(-MAX_ITEMS)
    .map((h) => ({ role: h.role, content: h.content.slice(0, MAX_CHARS) }));

  // The Claude API needs the conversation to start with a user turn and to alternate roles.
  while (items.length && items[0].role !== 'user') items.shift();
  const alternating = [];
  for (const item of items) {
    const last = alternating[alternating.length - 1];
    if (last && last.role === item.role) last.content += '\n\n' + item.content;
    else alternating.push({ ...item });
  }
  // The new question is appended as a user turn, so the history must end on an assistant turn.
  if (alternating.length && alternating[alternating.length - 1].role === 'user') alternating.pop();
  return alternating;
}

/**
 * @param {Array|undefined} sessionMessages  messages kept in server memory for this sessionId
 * @param {Array|undefined} history          `history` from the request body
 * @param {string} message                    the new question
 */
function buildMessages(sessionMessages, history, message) {
  const base = Array.isArray(sessionMessages) && sessionMessages.length
    ? sessionMessages
    : cleanHistory(history);
  return [...base, { role: 'user', content: String(message).slice(0, MAX_CHARS) }];
}

/**
 * The app sends `language: "de" | "en"`. Returns a line to append to the system prompt so the
 * bot answers in the user's app language (German stays the default).
 */
function languageInstruction(language) {
  return language === 'en'
    ? '\n\nThe user is using the app in English. Answer in English; keep German product and legal terms ' +
        '(e.g. Tagesgeld, Girokonto, Riester) where they matter, with a short English explanation.'
    : '';
}

module.exports = { buildMessages, cleanHistory, languageInstruction };
