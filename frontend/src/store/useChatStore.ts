import { create } from "zustand";
import type { chatState } from "@/types/store"; //Định nghĩa chatState tại type/store
import { persist } from "zustand/middleware";

export const useChatStore = create<chatState>();
