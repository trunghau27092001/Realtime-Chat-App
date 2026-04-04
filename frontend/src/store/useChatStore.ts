import { create } from "zustand";
import type { chatState } from "@/types/store"; //Định nghĩa chatState tại type/store
import { persist } from "zustand/middleware";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { chatService } from "@/services/chatService";

export const useChatStore = create<chatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      loading: false,
      //khởi tạo các state ban đầu

      setActiveConversation: (id) => set({ activeConversationId: id }), //hàm này để set lại id cho state
      reset: () => {
        //reset các state về trạng thái ban đầu
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          loading: false,
        });
      },

      fetchConversations: async () => {
        try {
          set({ loading: true });
          const { conversations } = await chatService.fetchConversation();
          set({ conversations });
        } catch (error) {
          const err = error as AxiosError;

          console.error(err.response);
          toast.error("Lỗi xảy ra khi set Conversation");
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }), //Chỉ lưu lại danh sách cuộc hội thoại
      // không lưu danh sách tin nhắn tránh để hacker đọc được
    },
  ),
);
