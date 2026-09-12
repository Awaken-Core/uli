import UserAvatar from "@/modules/profile/components/profile-icon";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
};
type Conversation = {
  id: string;
  title: string;
  date: string;
  messages: Message[];
};
const GREEN = "#C5FF27",
  INK = "#101010",
  PANEL = "#191919",
  MUTED = "#929292";

const initialChats: Conversation[] = [
  {
    id: "today",
    title: "Today’s meal check-in",
    date: "2 min ago",
    messages: [
      {
        id: "1",
        role: "agent",
        text: "Hey Mehul! What have you eaten so far today? I can estimate calories and keep a running total.",
        time: "9:41 AM",
      },
      {
        id: "2",
        role: "user",
        text: "Two eggs, toast, and a cup of chai for breakfast.",
        time: "9:42 AM",
      },
      {
        id: "3",
        role: "agent",
        text: "Got it — that’s roughly 410 kcal.\n\n2 eggs  ·  140 kcal\nToast  ·  160 kcal\nChai  ·  110 kcal\n\nYou’re at 410 kcal today. Want to add anything else?",
        time: "9:42 AM",
      },
    ],
  },
  {
    id: "protein",
    title: "High-protein dinner ideas",
    date: "Yesterday",
    messages: [
      {
        id: "4",
        role: "user",
        text: "Give me a quick high-protein dinner under 600 calories.",
        time: "7:18 PM",
      },
      {
        id: "5",
        role: "agent",
        text: "Try a paneer power bowl with roasted vegetables and mint yogurt — about 540 kcal and 34g protein.",
        time: "7:18 PM",
      },
    ],
  },
  {
    id: "weekly",
    title: "Weekly nutrition recap",
    date: "Monday",
    messages: [
      {
        id: "6",
        role: "agent",
        text: "You averaged 1,940 kcal per day and hit your protein goal on five days. Nice consistency.",
        time: "6:30 PM",
      },
    ],
  },
];

const prompts = [
  {
    icon: "restaurant-outline" as const,
    label: "Log a meal",
    value: "I want to log what I just ate",
  },
  {
    icon: "calendar-outline" as const,
    label: "Plan my day",
    value: "Help me plan balanced meals for today",
  },
  {
    icon: "sparkles-outline" as const,
    label: "Quick recipe",
    value: "Suggest a healthy recipe under 500 calories",
  },
];

function replyFor(input: string) {
  const value = input.toLowerCase();
  if (value.includes("recipe") || value.includes("dinner"))
    return "Try a 15-minute masala chickpea bowl with cucumber, tomato, yogurt, and a little rice. It’s about 480 kcal with 22g protein.";
  if (value.includes("plan") || value.includes("today"))
    return "Let’s build a balanced day: a protein-rich breakfast, colourful lunch, fruit or yogurt for a snack, and a lighter dinner. Tell me your calorie target and I’ll make it precise.";
  if (value.includes("ate") || value.includes("had") || value.includes("log"))
    return "I can log that. Tell me the food, approximate portion, and how it was cooked — for example, “one bowl of dal with a cup of rice.”";
  return "I’m here for it. I can log meals, estimate calories, suggest recipes, or help plan a balanced day. What would be most useful?";
}

export default function ChatScreen() {
  const [chats, setChats] = useState(initialChats),
    [activeId, setActiveId] = useState("today");
  const [draft, setDraft] = useState(""),
    [drawerOpen, setDrawerOpen] = useState(false),
    [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null),
    timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = chats.find((chat) => chat.id === activeId) ?? chats[0];

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [active.messages, thinking]);

  function createChat() {
    const chat = {
      id: Date.now().toString(),
      title: "New conversation",
      date: "Now",
      messages: [],
    };
    setChats((current) => [chat, ...current]);
    setActiveId(chat.id);
    setDrawerOpen(false);
  }
  function send(prompt?: string) {
    const text = (prompt ?? draft).trim();
    if (!text || thinking) return;
    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setDraft("");
    setThinking(true);
    setChats((current) =>
      current.map((chat) =>
        chat.id === activeId
          ? {
            ...chat,
            title: chat.messages.length ? chat.title : text.slice(0, 32),
            date: "Now",
            messages: [
              ...chat.messages,
              {
                id: Date.now().toString(),
                role: "user" as const,
                text,
                time,
              },
            ],
          }
          : chat,
      ),
    );
    timerRef.current = setTimeout(() => {
      setChats((current) =>
        current.map((chat) =>
          chat.id === activeId
            ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `${Date.now()}a`,
                  role: "agent" as const,
                  text: replyFor(text),
                  time: new Date().toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                },
              ],
            }
            : chat,
        ),
      );
      setThinking(false);
    }, 850);
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.safe}>
      <KeyboardAvoidingView
        style={s.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={s.header}>
          <Pressable onPress={() => setDrawerOpen(true)} style={s.iconButton}>
            <Ionicons name="menu" size={22} color="#FFF" />
          </Pressable>
          <View style={s.headerCopy}>
            <Text numberOfLines={1} style={s.headerTitle}>
              {active.title}
            </Text>
            <View style={s.status}>
              <View style={s.online} />
              <Text style={s.subtitle}>Uli is online</Text>
            </View>
          </View>
          <Pressable onPress={createChat} style={s.iconButton}>
            <Ionicons name="create-outline" size={21} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={[
            s.messagesContent,
            !active.messages.length && s.emptyContent,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          {!active.messages.length ? (
            <View style={s.empty}>
              <View style={s.heroIcon}>
                <Ionicons name="sparkles" size={25} color={INK} />
              </View>
              <Text style={s.heroTitle}>How can I help?</Text>
              <Text style={s.heroText}>
                Track a meal, plan your nutrition, or build a healthier routine
                with Uli.
              </Text>
              <View style={s.promptList}>
                {prompts.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => send(item.value)}
                    style={s.prompt}
                  >
                    <View style={s.promptIcon}>
                      <Ionicons name={item.icon} size={18} color={GREEN} />
                    </View>
                    <Text style={s.promptLabel}>{item.label}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#666" />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            active.messages.map((message) => (
              <View
                key={message.id}
                style={[s.messageRow, message.role === "user" && s.userRow]}
              >
                {message.role === "agent" && (
                  <View style={s.avatar}>
                    <View style={s.inneravatar}>
                      <UserAvatar username="uli" />
                    </View>
                  </View>
                )}
                <View
                  style={[
                    s.messageGroup,
                    message.role === "user" && s.userGroup,
                  ]}
                >
                  <View
                    style={[
                      s.bubble,
                      message.role === "user" ? s.userBubble : s.agentBubble,
                    ]}
                  >
                    <Text
                      style={[
                        s.messageText,
                        message.role === "user" && s.userText,
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                  <Text style={s.time}>{message.time}</Text>
                </View>
              </View>
            ))
          )}
          {thinking && (
            <View style={s.messageRow}>
              <View style={s.avatar}>
                <View style={s.inneravatar}>
                  <UserAvatar username="uli" />
                </View>
              </View>
              <View style={s.typing}>
                <View style={s.dot} />
                <View style={[s.dot, { opacity: 0.6 }]} />
                <View style={[s.dot, { opacity: 0.3 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={s.composerWrap}>
          <View style={s.composer}>
            <Ionicons name="add" size={24} color="#888" />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message Uli Agent..."
              placeholderTextColor="#737373"
              multiline
              maxLength={500}
              style={s.input}
            />
            <Pressable
              disabled={!draft.trim() || thinking}
              onPress={() => send()}
              style={[s.send, (!draft.trim() || thinking) && s.sendDisabled]}
            >
              <Ionicons name="arrow-up" size={19} color={INK} />
            </Pressable>
          </View>
          <Text style={s.disclaimer}>Demo mode · Uli can make mistakes</Text>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={s.modal}>
          <Pressable style={s.scrim} onPress={() => setDrawerOpen(false)} />
          <View style={s.drawer}>
            <SafeAreaView style={s.drawerSafe}>
              <View style={s.drawerHeader}>
                <View style={s.brandMark}>
                  <Ionicons name="flame" size={19} color={INK} />
                </View>
                <Text style={s.brand}>Uli.</Text>
                <Pressable onPress={() => setDrawerOpen(false)}>
                  <Ionicons name="close" size={23} color="#FFF" />
                </Pressable>
              </View>
              <Pressable onPress={createChat} style={s.newChat}>
                <Ionicons name="add" size={20} color={INK} />
                <Text style={s.newChatText}>New conversation</Text>
              </Pressable>
              <Text style={s.sectionLabel}>RECENT CHATS</Text>
              <ScrollView>
                {chats.map((chat) => (
                  <Pressable
                    key={chat.id}
                    onPress={() => {
                      setActiveId(chat.id);
                      setDrawerOpen(false);
                    }}
                    style={[s.chatItem, chat.id === activeId && s.chatActive]}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={17}
                      color={chat.id === activeId ? GREEN : "#777"}
                    />
                    <View style={s.chatCopy}>
                      <Text
                        numberOfLines={1}
                        style={[
                          s.chatTitle,
                          chat.id === activeId && { color: "#FFF" },
                        ]}
                      >
                        {chat.title}
                      </Text>
                      <Text style={s.chatDate}>{chat.date}</Text>
                    </View>
                    {chat.id === activeId && <View style={s.activeDot} />}
                  </Pressable>
                ))}
              </ScrollView>
              <View style={s.demoCard}>
                <View style={s.demoIcon}>
                  <Ionicons name="sparkles" size={14} color={INK} />
                </View>
                <View>
                  <Text style={s.demoTitle}>Uli is ready</Text>
                  <Text style={s.demoText}>Replies are generated locally</Text>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: INK },
  screen: { flex: 1, backgroundColor: INK },
  header: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#303030",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1C",
  },
  headerCopy: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  status: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  online: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  subtitle: { color: MUTED, fontSize: 10 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingTop: 24 },
  emptyContent: { flexGrow: 1, justifyContent: "center" },
  empty: { alignItems: "center", paddingBottom: 20 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    marginBottom: 20,
  },
  heroTitle: { color: "#FFF", fontSize: 27, fontWeight: "800" },
  heroText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 310,
    marginTop: 8,
  },
  promptList: { width: "100%", gap: 9, marginTop: 28 },
  prompt: {
    height: 58,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#303030",
    backgroundColor: PANEL,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 11,
  },
  promptIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
  },
  promptLabel: { flex: 1, color: "#F3F3F3", fontSize: 13, fontWeight: "600" },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 22,
  },
  userRow: { justifyContent: "flex-end" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    backgroundColor: GREEN,
  },
  inneravatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  messageGroup: { maxWidth: "80%" },
  userGroup: { alignItems: "flex-end" },
  bubble: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  agentBubble: {
    backgroundColor: PANEL,
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#292929",
  },
  userBubble: { backgroundColor: GREEN, borderBottomRightRadius: 5 },
  messageText: { color: "#EAEAEA", fontSize: 13.5, lineHeight: 21 },
  userText: { color: INK },
  time: { color: "#666", fontSize: 9, marginTop: 5, marginHorizontal: 3 },
  typing: {
    height: 41,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 15,
    backgroundColor: PANEL,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  composerWrap: {
    padding: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#292929",
  },
  composer: {
    minHeight: 52,
    maxHeight: 120,
    borderRadius: 19,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: "#303030",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 9,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 10,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  sendDisabled: { backgroundColor: "#3A3A3A" },
  disclaimer: { color: "#555", fontSize: 9, textAlign: "center", marginTop: 6 },
  modal: { flex: 1 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.65)",
  },
  drawer: {
    width: "84%",
    maxWidth: 340,
    height: "100%",
    backgroundColor: "#141414",
    borderRightWidth: 1,
    borderRightColor: "#292929",
  },
  drawerSafe: { flex: 1, paddingHorizontal: 14 },
  drawerHeader: { height: 70, flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 10,
    flex: 1,
  },
  newChat: {
    height: 50,
    borderRadius: 16,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  newChatText: { color: INK, fontSize: 13, fontWeight: "800" },
  sectionLabel: {
    color: "#626262",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    margin: 20,
    marginBottom: 8,
  },
  chatItem: {
    minHeight: 63,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  chatActive: { backgroundColor: "#22251E" },
  chatCopy: { flex: 1 },
  chatTitle: { color: "#B0B0B0", fontSize: 12.5, fontWeight: "600" },
  chatDate: { color: "#606060", fontSize: 9, marginTop: 4 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  demoCard: {
    height: 66,
    borderRadius: 17,
    backgroundColor: "#1C1C1C",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    marginVertical: 14,
  },
  demoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  demoTitle: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  demoText: { color: "#666", fontSize: 9, marginTop: 3 },
});
