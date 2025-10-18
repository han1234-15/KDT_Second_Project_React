import React, { useState } from "react";
import styles from "./Login.module.css";
import { FaUser, FaLock } from "react-icons/fa";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/images/logo.png";
import { caxios } from "../../config/config";

export default function Login() {
    const [form, setForm] = useState({ id: "", pw: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const login = useAuthStore(state => state.login);
    const logout = useAuthStore(state => state.logout);
    const handleSubmit = (e) => {

        if (form.id == "" || form.pw == "") {
            alert("아이디와 비밀번호를 입력해주세요");
            return;
        }
        console.log("로그인 시도:", form);

        caxios
            .post("/auth", form)
            .then((resp) => {
                login(resp.data);
            })
            .catch(() => {
                sessionStorage.removeItem("token");
                logout();
            });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.logo}>
                    <div><img src={logo} /></div>
                    <span className={styles.highlight}>INFINITY</span>
                </h1>
                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <FaUser className={styles.icon} />
                        <input
                            type="text"
                            name="id"
                            placeholder="아이디"
                            value={form.id}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <FaLock className={styles.icon} />
                        <input
                            type="password"
                            name="pw"
                            placeholder="비밀번호"
                            value={form.pw}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="button" className={styles.button} onClick={handleSubmit}>
                        로그인
                    </button>
                </div>
                <div className={styles.footer}>
                    <a href="#">아이디 찾기</a> | <a href="#">비밀번호 찾기</a>
                </div>
            </div>
            <footer className={styles.copy}>© 2025 Infinity. All Rights Reserved.</footer>
        </div>
    );
}