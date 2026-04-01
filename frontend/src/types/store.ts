import type { Conversation, Message } from "./chat";
import type { User } from "./user";

export interface authState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<boolean>;
  signIn: (username: string, password: string) => Promise<boolean>;

  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface themeState {
  isDark: boolean;

  toggleTheme: () => void; //hàm này xử lí theme khi nhấn nút
  setTheme: (dark: boolean) => void; // hàm này thì để xử lí thẳng state isDark
}

export interface chatState {
  conversations: Conversation[]; //dánh sách các cuộc trò chuyện: mảng Id
  messages: Record<
    //giống như map để lưu dữ liệu theo key value
    string, //ghi lại id của Conversation
    {
      items: Message[]; //ở đây sẽ lưu theo kiểu 1 conversation và mảng các tin nhắn
      hasMore: boolean; //để biết còn tin nhắn cũ chưa load hay không
      nextCursor?: string | null; //con trỏ để biết lần tiếp theo fetch từ tin nhắn nào
    }
  >;
  activeConversationId: string | null; // lưu id của cuộc trò chuyện đang mở, thay đổi khi click cuộc trò chuyện khác
  loading: boolean; //Theo dõi trạng thái req đã hoàn thành chưa

  reset: () => void; //reset các state về lại giá trị mặc định

  setActiveConversation: (id: string | null) => void;
}
