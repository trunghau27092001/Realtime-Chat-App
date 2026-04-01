import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { authState } from "@/types/store";
import type { AxiosError } from "axios";
import { persist } from "zustand/middleware";

export const useAuthStore = create<authState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      clearState: () => {
        set({ accessToken: null, user: null, isLoading: true });
        localStorage.clear();
      },

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ isLoading: true });

          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName,
          );

          toast.success("Đăng kí thành công");
          return true;
        } catch (error) {
          const err = error as AxiosError;

          console.error(err.response);
          toast.error("Đăng kí thất bại");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (username, password) => {
        try {
          set({ isLoading: true });

          localStorage.clear();
          const { accessToken } = await authService.signIn(username, password);
          get().setAccessToken(accessToken);

          toast.success("Đăng nhập thành công");

          await get().fetchMe();
          return true;
        } catch (error) {
          const err = error as AxiosError;

          console.error(err.response);

          toast.error("Đăng nhập thất bại");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();
          toast.success("Bạn đã đăng xuất");
        } catch (error) {
          const err = error as AxiosError;

          console.error(err.response);
          toast.error("Đăng xuất thất bại! Vui lòng thử lại");
        }
      },

      fetchMe: async () => {
        try {
          //console.log("chạy fetchMe");
          set({ isLoading: true });

          const user = await authService.fetchMe();

          set({ user });
        } catch (error) {
          const err = error as AxiosError;

          console.error(err.response);
          get().clearState();
          toast.error(
            "Lỗi khi truy cập dữ liệu người dùng. Vui lòng thử lại sau",
          );
        } finally {
          set({ isLoading: false });
        }
      },

      refreshToken: async () => {
        try {
          set({ isLoading: true });
          const accessToken = await authService.refreshToken();
          get().setAccessToken(accessToken);

          // if (!user) {
          //   await fetchMe()
          // }
        } catch (error) {
          const err = error as AxiosError;

          console.error(err.response);
          get().clearState();
          //toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", //đặt tên là auth-storage
      partialize: (state) => ({
        //partialize dùng để chỉ định đ úng user cần được lưu lại trong state thôi,
        //còn mấy cái như accessToken thì không đụng đến
        user: state.user,
      }),
    },
  ),
);
