import { create } from "zustand";

import {
  chatApi,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/api";

type ChatState = {
  conversations: ChatConversation[];
  conversationId?: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  load: (conversationId?: string) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  startConversation: () => void;
  sendMessage: (message: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
};

const initialState = {
  conversations: [],
  conversationId: undefined,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
} satisfies Pick<
  ChatState,
  | "conversations"
  | "conversationId"
  | "messages"
  | "isLoading"
  | "isSending"
  | "error"
>;

let optimisticId = 0;

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Unable to update the chat.";
}

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  load: async (conversationId) => {
    if (get().isLoading || get().isSending) return;
    set({ isLoading: true, error: null });
    try {
      const history = await chatApi.getHistory(conversationId);
      set({
        conversations: history.conversations,
        conversationId: history.conversation?.id,
        messages: history.messages,
      });
    } catch (error) {
      set({ error: messageFrom(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  selectConversation: async (conversationId) => {
    if (
      get().isLoading ||
      get().isSending ||
      conversationId === get().conversationId
    ) {
      return;
    }
    await get().load(conversationId);
  },

  startConversation: () => {
    if (get().isLoading || get().isSending) return;
    set({ conversationId: undefined, messages: [], error: null });
  },

  sendMessage: async (value) => {
    const message = value.trim();
    if (!message || get().isLoading || get().isSending) return false;

    optimisticId += 1;
    const id = `optimistic-${optimisticId}`;
    const conversationId = get().conversationId;
    const optimisticMessage: ChatMessage = {
      id,
      role: "user",
      message,
      createdAt: new Date().toISOString(),
    };

    set({
      messages: [...get().messages, optimisticMessage],
      isSending: true,
      error: null,
    });

    try {
      const reply = await chatApi.sendMessage(message, conversationId);
      const savedUser = reply.messages.find(({ role }) => role === "user");
      const savedAgent = reply.messages.find(({ role }) => role === "agent");
      const reconciled = get().messages.map((item) =>
        item.id === id && savedUser ? savedUser : item,
      );

      set({
        conversationId: reply.conversation.id,
        conversations: [
          reply.conversation,
          ...get().conversations.filter(
            ({ id: currentId }) => currentId !== reply.conversation.id,
          ),
        ],
        messages: savedAgent ? [...reconciled, savedAgent] : reconciled,
      });
      return true;
    } catch (error) {
      set({
        messages: get().messages.filter(({ id: currentId }) => currentId !== id),
        error: messageFrom(error),
      });
      return false;
    } finally {
      set({ isSending: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));
