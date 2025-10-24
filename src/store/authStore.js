import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: "",
  isLogin: false,
  userProfile: "",
  login: (token) => {
    set((state) => {
      sessionStorage.setItem("token", token); // 
      return { token: token, isLogin: true }; //인메모리 저장을 위한 리턴
    });
  },

  logout: () => {
    sessionStorage.removeItem("token");
    set({
      token: "", isLogin: false, 
      userInfo: {
        name: "",
        dept_code: "",
        rank_code: "",
        officeEmail: "",
      },
    });
  },
   // 사용자 정보 업데이트
   setUserProfile: (newInfo) => {
    set({ userProfile: newInfo });
  },
}));

export default useAuthStore;
