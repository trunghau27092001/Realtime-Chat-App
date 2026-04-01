import type { themeState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create<themeState>()(
  persist(
    (set, get) => ({
      isDark: false, //mặc định Theme sáng
      toggleTheme: () => {
        //thay đổi trạng thái theme khi nhấn nút
        // cụ thể là stwich true/false của biến isDark
        const newValue = !get().isDark; //logic là chỉ cần lấy !isDark
        //sau đó gọi setTheme để set lại state isDark là xong
        get().setTheme(newValue);
        // if (newValue) {
        //   document.documentElement.classList.add("dark");
        // } else document.documentElement.classList.remove("dark");
      },
      setTheme: (dark: boolean) => {
        set({ isDark: dark }); //này đơn giản chỉ là set State isDark thôi
        // if (dark) {
        //   document.documentElement.classList.add("dark");
        // } else document.documentElement.classList.remove("dark");
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);
