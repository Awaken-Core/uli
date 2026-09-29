import { Text, TextInput } from "@/components/ui/typography";
import UserAvatar from "@/modules/profile/components/profile-icon";
import { useChatStore } from "@/stores/chat-store";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GREEN = "#C5FF27";
const INK = "#101010";
const PANEL = "#191919";
const MUTED = "#929292";

const prompts = [
  {
    icon: "restaurant-outline" as const,
    label: "Analyze my macros for today",
    value: "Analyze my macros for today",
  },
  {
    icon: "flame-outline" as const,
    label: "High-protein snack under 200 kcal",
    value: "High-protein snack under 200 kcal",
  },
  {
    icon: "checkmark-circle-outline" as const,
    label: "Plan tomorrow's priority tasks",
    value: "Plan my top priority tasks for tomorrow",
  },
  {
    icon: "water-outline" as const,
    label: "Hydration tip for afternoon fatigue",
    value: "Hydration tip for afternoon fatigue",
  },
];

function messageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function conversationDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatScreen() {
  const {
    conversations,
    conversationId,
    messages,
    isLoading,
    isSending,
    error,
    load,
    selectConversation,
    startConversation,
    sendMessage,
  } = useChatStore();
  const [draft, setDraft] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const activeConversation = conversations.find(({ id }) => id === conversationId);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      50,
    );
    return () => clearTimeout(timer);
  }, [messages, isSending]);

  function createChat() {
    if (isSending || isLoading) return;
    startConversation();
    setDraft("");
    setDrawerOpen(false);
  }

  async function chooseConversation(id: string) {
    setDrawerOpen(false);
    await selectConversation(id);
  }

  async function send(prompt?: string) {
    const text = (prompt ?? draft).trim();
    if (!text || isSending || isLoading) return;
    setDraft("");
    const sent = await sendMessage(text);
    if (!sent && !prompt) setDraft(text);
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.safe}>
      <KeyboardAvoidingView
        style={s.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={s.header}>
          <Pressable
            accessibilityLabel="Open conversations"
            onPress={() => setDrawerOpen(true)}
            style={s.iconButton}
          >
            <Ionicons name="menu" size={22} color="#FFF" />
          </Pressable>
          <View style={s.headerCopy}>
            <Text numberOfLines={1} style={s.headerTitle}>
              {activeConversation?.title ?? "New conversation"}
            </Text>
            <View style={s.status}>
              <View style={s.online} />
              <Text style={s.subtitle}>Uli is online</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="New conversation"
            disabled={isSending || isLoading}
            onPress={createChat}
            style={[
              s.iconButton,
              (isSending || isLoading) && s.buttonDisabled,
            ]}
          >
            <Ionicons name="create-outline" size={21} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={[s.messagesContent, !messages.length && s.emptyContent]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={s.loadingState}>
              <ActivityIndicator color={GREEN} />
              <Text style={s.loadingText}>Loading conversation...</Text>
            </View>
          ) : !messages.length ? (
            <View style={s.empty}>
              <View style={s.heroIcon}>
                <Ionicons name="sparkles" size={25} color={INK} />
              </View>
              <Text style={s.heroTitle}>How can I help today?</Text>
              <Text style={s.heroText}>
                Track a meal, plan your nutrition, or build a healthier routine with Uli.
              </Text>
              <View style={s.promptList}>
                {prompts.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => void send(item.value)}
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
            messages.map((message) => (
              <View
                key={message.id}
                style={[s.messageRow, message.role === "user" && s.userRow]}
              >
                {message.role === "agent" && (
                  <View style={s.avatar}>
                    <View style={s.innerAvatar}>
                      <UserAvatar username="uli" />
                    </View>
                  </View>
                )}
                <View style={[s.messageGroup, message.role === "user" && s.userGroup]}>
                  <View
                    style={[
                      s.bubble,
                      message.role === "user" ? s.userBubble : s.agentBubble,
                    ]}
                  >
                    <Text style={[s.messageText, message.role === "user" && s.userText]}>
                      {message.message}
                    </Text>
                  </View>
                  <Text style={s.time}>{messageTime(message.createdAt)}</Text>
                </View>
              </View>
            ))
          )}

          {isSending && (
            <View style={s.messageRow}>
              <View style={s.avatar}>
                <View style={s.innerAvatar}>
                  <UserAvatar username="uli" />
                </View>
              </View>
              <View style={s.typing}>
                <ActivityIndicator size="small" color={GREEN} />
                <Text style={s.thinkingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {!!error && (
            <View style={s.errorCard}>
              <Ionicons name="alert-circle-outline" size={18} color="#FF8B8B" />
              <Text style={s.errorText}>{error}</Text>
              {!messages.length && (
                <Pressable onPress={() => void load(conversationId)}>
                  <Text style={s.retryText}>Retry</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>

        <View style={s.composerWrap}>
          <View style={s.composer}>
            <Ionicons name="sparkles-outline" size={21} color="#888" />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message Uli..."
              placeholderTextColor="#737373"
              multiline
              maxLength={8000}
              editable={!isLoading}
              style={s.input}
            />
            <Pressable
              accessibilityLabel="Send message"
              disabled={!draft.trim() || isSending || isLoading}
              onPress={() => void send()}
              style={[
                s.send,
                (!draft.trim() || isSending || isLoading) && s.sendDisabled,
              ]}
            >
              <Ionicons name="arrow-up" size={19} color={INK} />
            </Pressable>
          </View>
          <Text style={s.disclaimer}>Uli can make mistakes</Text>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={s.modal}>
          <Pressable
            accessibilityLabel="Close conversations"
            style={s.scrim}
            onPress={() => setDrawerOpen(false)}
          />
          <View style={s.drawer}>
            <SafeAreaView style={s.drawerSafe}>
              <View style={s.drawerHeader}>
                <View style={s.brandMark}>
                  <Ionicons name="flame" size={19} color={INK} />
                </View>
                <Text style={s.brand}>Uli.</Text>
                <Pressable
                  accessibilityLabel="Close conversations"
                  onPress={() => setDrawerOpen(false)}
                >
                  <Ionicons name="close" size={23} color="#FFF" />
                </Pressable>
              </View>
              <Pressable
                disabled={isSending || isLoading}
                onPress={createChat}
                style={[
                  s.newChat,
                  (isSending || isLoading) && s.buttonDisabled,
                ]}
              >
                <Ionicons name="add" size={20} color={INK} />
                <Text style={s.newChatText}>New conversation</Text>
              </Pressable>
              <Text style={s.sectionLabel}>CONVERSATIONS</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {!conversations.length && !isLoading && (
                  <Text style={s.noChats}>Your conversations will appear here.</Text>
                )}
                {conversations.map((conversation) => {
                  const active = conversation.id === conversationId;
                  return (
                    <Pressable
                      key={conversation.id}
                      disabled={isSending || isLoading}
                      onPress={() => void chooseConversation(conversation.id)}
                      style={[s.chatItem, active && s.chatActive]}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={17}
                        color={active ? GREEN : "#777"}
                      />
                      <View style={s.chatCopy}>
                        <Text
                          numberOfLines={1}
                          style={[s.chatTitle, active && s.chatTitleActive]}
                        >
                          {conversation.title}
                        </Text>
                        <Text style={s.chatDate}>
                          {conversationDate(conversation.updatedAt)}
                        </Text>
                      </View>
                      {active && <View style={s.activeDot} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={s.syncCard}>
                <View style={s.syncIcon}>
                  <Ionicons name="cloud-done-outline" size={15} color={INK} />
                </View>
                <View>
                  <Text style={s.syncTitle}>Synced to your account</Text>
                  <Text style={s.syncText}>History is shared with the web app</Text>
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
  buttonDisabled: { opacity: 0.45 },
  headerCopy: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  status: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  online: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  subtitle: { color: MUTED, fontSize: 10 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingTop: 24 },
  emptyContent: { flexGrow: 1, justifyContent: "center" },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { color: MUTED, fontSize: 12 },
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
  innerAvatar: {
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
    gap: 8,
    paddingHorizontal: 15,
    backgroundColor: PANEL,
  },
  thinkingText: { color: MUTED, fontSize: 11 },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#5A3030",
    backgroundColor: "#291B1B",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: { color: "#FFB1B1", fontSize: 11, flex: 1 },
  retryText: { color: GREEN, fontSize: 11, fontWeight: "700" },
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
  input: { flex: 1, color: "#FFF", fontSize: 14, maxHeight: 100, paddingVertical: 10 },
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
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,.65)" },
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
  brand: { color: "#FFF", fontSize: 20, fontWeight: "800", marginLeft: 10, flex: 1 },
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
  noChats: { color: MUTED, fontSize: 11, textAlign: "center", marginTop: 24 },
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
  chatTitleActive: { color: "#FFF" },
  chatDate: { color: "#606060", fontSize: 9, marginTop: 4 },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  syncCard: {
    minHeight: 66,
    borderRadius: 17,
    backgroundColor: "#1C1C1C",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    marginVertical: 14,
  },
  syncIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  syncTitle: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  syncText: { color: "#666", fontSize: 9, marginTop: 3 },
});
