import styles from "./Contacts.module.css";
import { ranks } from "../../config/options.js";

const OrganizationView = ({ member, onClose }) => {
    return (
        <div
            style={{
                width: "450px",
                minHeight: "420px",
                background: "white",
                padding: "35px 0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    marginRight: "70px",
                    textAlign: "center",
                    marginBottom: "25px",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px", // 각 구분자 간 균등 간격
                }}
            >
                <span style={{ color: "#333" }}>{member.name}</span>
                <span style={{ color: "#999" }}>/</span>
                <span style={{ color: "#333" }}> {member.dept_code}</span>
                <span style={{ color: "#999" }}>/</span>
                <span style={{ color: "#2196f3" }}>{ranks[member.rank_code]}</span>
            </div>

            <hr
                style={{
                    width: "80%",
                    border: "none",
                    borderTop: "1px solid #999898ff",
                    margin: "10px auto 25px auto",
                    marginRight:"70px"
                }}
            />

            {/* ✅ 본문 (앞글자 정렬) */}
            <div
                style={{
                    width: "100%",
                    fontSize: "16px",
                    color: "#444",
                    display: "flex",
                    flexDirection: "column",
                    marginTop:"20px",
                    marginLeft: "150px",
                    gap: "10px",
                    marginBottom: "45px",
                }}
            >
                {[
                    ["아이디", member.id.includes("@") ? member.id : `${member.id}@Infinity.com`],
                    ["회사 이메일", member.officeEmail || "-"],
                    ["개인 이메일", member.personalEmail || "-"],
                    ["회사 번호", member.officePhone || "-"],
                    ["개인 번호", member.mobilePhone || "-"],
                ].map(([label, value], idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <span
                            style={{
                                width: "100px",
                                fontWeight: "600",
                                color: "#333",
                                textAlign: "left",
                                paddingRight: "10px",
                            }}
                        >
                            {label}
                        </span>
                        <span style={{ flex: 1, color: "#555" }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* ✅ 하단 버튼 */}
            <button
                onClick={onClose}
                style={{
                    padding: "8px 22px",
                    background: "linear-gradient(45deg, #8e44ad, #2196f3)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease-in-out",
                    marginRight:"50px",
                }}
                onMouseOver={(e) => (e.target.style.opacity = "0.9")}
                onMouseOut={(e) => (e.target.style.opacity = "1")}
            >
                닫기
            </button>
        </div>
    );
};

export default OrganizationView;
