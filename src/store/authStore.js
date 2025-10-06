import { create } from 'zustand';

const useAuthStore = create((set) => ({
    token: "",
    isLogin: false,
    login: (token) => {
        sessionStorage.setItem("token", token);
        set({ token: token, isLogin: true })
    },
    logout: () => {
        sessionStorage.removeItem("token");
        set({ token: "", isLogin: false })
    }

}));

export default useAuthStore;