import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: "",
  isLogin: false,

  login: (token) => {
    set((state) => {
      sessionStorage.setItem("token", token); // 
      return { token: token, isLogin: true }; //인메모리 저장을 위한 리턴
    });
  },

  logout: () => {
    sessionStorage.removeItem("token");
    set({ token: "", isLogin: false });
  }

}));

export default useAuthStore;
