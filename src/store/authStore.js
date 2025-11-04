import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: "",
      loginId: "",
      isLogin: false,

      login: (token, loginId) => {
        console.log("로그인 정보 저장됨:", token, loginId);
        set({ token, loginId, isLogin: true });
      },

      logout: () => {
        console.log("로그아웃 실행됨");
        localStorage.clear();
        sessionStorage.clear();
        set({ token: "", loginId: "", isLogin: false });
      },
    }),
    {
      name: "auth-storage", // 세션스토리지 키 이름
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

export default useAuthStore;
