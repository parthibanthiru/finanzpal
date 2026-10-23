import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { HISTORY_LIMIT, HistoryItem, sendChatMessage } from '@/lib/api';
import { ChatMsg as Msg, clearHistory, loadHistory, saveExchange } from '@/lib/history';
import { makeStyles, radius, spacing, useColors } from '@/components/theme';

const QUICK_TOPICS = ['Tagesgeld', 'ETF-Sparplan', 'Girokonto', 'Versicherungen', 'Kredite', 'Altersvorsorge'];

const DISCLAIMER =
  'Hinweis: Finanzpal gibt allgemeine Informationen und Vergleiche, keine individuelle Anlage- oder Versicherungsberatung.';

export default function ChatScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  const welcome: Msg = {
    id: 'welcome',
    role: 'bot',
    text: `Hallo${firstName ? ` ${firstName}` : ''}! 👋 Wobei kann ich dir heute helfen? Wähle ein Thema oder stell einfach deine Frage.`,
  };

  // New backend conversation id on every start / after "Neu" (backend keeps context per id).
  const [sessionId, setSessionId] = useState(() => `${user?.id ?? 'anon'}-${Date.now()}`);
  const [messages, setMessages] = useState<Msg[]>([welcome]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  // Load saved chat history once.
  useEffect(() => {
    loadHistory()
      .then((history) => setMessages([welcome, ...history]))
      .catch((e) => console.warn('[Finanzpal] Verlauf konnte nicht geladen werden:', e?.message))
      .finally(() => setLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmClear() {
    Alert.alert('Neuer Chat', 'Deinen bisherigen Chatverlauf löschen und neu beginnen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            if (user) await clearHistory(user.id);
            setMessages([welcome]);
            setSessionId(`${user?.id ?? 'anon'}-${Date.now()}`);
          } catch {
            Alert.alert('Fehler', 'Der Verlauf konnte nicht gelöscht werden. Bitte versuche es später erneut.');
          }
        },
      },
    ]);
  }

  // "Neu" button in the header.
  const header = (
    <Tabs.Screen
      options={{
        headerRight: () => (
          <Pressable onPress={confirmClear} style={{ paddingHorizontal: spacing.md }} accessibilityLabel="Neuer Chat">
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Neu</Text>
          </Pressable>
        ),
      }}
    />
  );

  if (loadingHistory) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput('');
    // Earlier messages for context: skip the greeting and error notices.
    const history: HistoryItem[] = messages
      .filter((m) => m.id !== 'welcome' && !m.id.startsWith('e-'))
      .slice(-HISTORY_LIMIT)
      .map((m): HistoryItem => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const { reply } = await sendChatMessage(sessionId, trimmed, history);
      setMessages((m) => [...m, { id: `b-${Date.now()}`, role: 'bot', text: reply }]);
      if (user) saveExchange(user.id, trimmed, reply); // fire-and-forget; errors are only logged
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unbekannter Fehler.';
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: 'bot', text: `⚠️ ${msg}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {header}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={{ color: item.role === 'user' ? colors.onUserBubble : colors.text, fontSize: 15, lineHeight: 21 }}>
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <>
            {sending && <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start', margin: spacing.sm }} />}
            {messages.length === 1 && (
              <View style={styles.chips}>
                {QUICK_TOPICS.map((t) => (
                  <Pressable key={t} style={styles.chip} onPress={() => send(`Ich interessiere mich für ${t}.`)}>
                    <Text style={styles.chipText}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
          </>
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Deine Frage…"
          placeholderTextColor={colors.muted}
          multiline
          onSubmitEditing={() => send(input)}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
          onPress={() => send(input)}
          disabled={!input.trim() || sending}
          accessibilityLabel="Senden"
        >
          <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '700' }}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  bubble: { maxWidth: '85%', padding: 12, borderRadius: radius.lg, marginBottom: spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.botBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
  },
  chipText: { color: colors.primary, fontWeight: '600' },
  disclaimer: { fontSize: 12, color: colors.muted, marginTop: spacing.lg, textAlign: 'center' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
