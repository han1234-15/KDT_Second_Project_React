import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/images/logo.png";
import { Avatar, Button, Dropdown, Menu, Space } from "antd";
import { BellOutlined, DownOutlined, LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { caxios } from "../../config/config";
import { ranks } from "../../config/options";
import { Send } from "react-bootstrap-icons";   // ✅ 부트스트랩 아이콘 추가
import defaultProfile from "../../assets/images/defaultProfile.png";




const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [hasNew, setHasNew] = useState(false);

    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    const [userProfile, setUserProfile] = useState(null); //프로필용 useState
    const token = useAuthStore(state => state.token);   // ✅ 메신저 팝업용 토큰

    const [memberInfo, setMemberInfo] = useState({
        name: "",
        dept_code: "연구&개발",
        rank_code: "사원",
        officeEmail: "",
    });
    const [loading, setLoading] = useState(true);

    const handleLogout = (e) => {
        console.log("로그아웃 시도");
        logout();
    };

    // ✅ 메신저 팝업 열기 함수
    const openMessenger = () => {
        const width = 400;
        const height = 550;
        const left = window.screen.width - width - 40;
        const top = window.screen.height - height - 100;

        const url = `${window.location.origin}/messenger-popup?token=${token}`;
        window.open(
            url,
            "MessengerPopup",
            `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
        );
    };

    const frofileMenu = [
        {
            label: (
                <div
                    style={{
                        width: 250,
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}
                    className="userInfoPopup"
                    onClick={() => navigate("/mypage")}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {userProfile ? (
                            <img
                                src={userProfile}
                                alt="프로필 미리보기"
                                style={{ width: 90, height: 90, borderRadius: '50%' }}
                            />
                        ) : (
                            <UserOutlined
                                style={{
                                    fontSize: 90,
                                    color: '#aaa',
                                    border: '2px solid #aaa',
                                    borderRadius: '50%',
                                    padding: 4,
                                    overflow: 'hidden'
                                }}
                            />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div className={styles.userName} style={{ fontSize: 22, fontWeight: 600, marginTop: '25px' }}>{memberInfo.name}</div>
                            <div style={{ fontSize: 15, color: '#666', marginTop: '2px' }}>
                                {ranks[memberInfo.rank_code]} / {memberInfo.dept_code}
                            </div>
                            <div style={{ fontSize: 12, color: '#666', marginTop: '2px' }}>
                                {memberInfo.officeEmail}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            marginTop: 8,
                            cursor: 'pointer',
                            color: '#1890ff',
                            textAlign: 'left'
                        }}
                    >
                        사용자 정보 수정
                    </div>
                </div>
            ),
            key: '1',
        },
        { type: 'divider' },
        {
            label: <div onClick={handleLogout} style={{ fontSize: '15px', paddingLeft: '10px' }}>
                <LogoutOutlined style={{ paddingRight: '10px', fontSize: '15px' }} />로그아웃
            </div>,
            key: '2',
        },
    ];

    const notificationUpdate = () => {
        caxios.put(`/notification/read`);
    }

    const getNotiLabel = (type) => {
        switch (type) {
            case "task":
                return "📋 업무 알림";
            case "taskgroup":
                return "📋 업무 그룹 알림";
            case "mail":
                return "✉️ 메일 알림";
            case "board":
                return "📰 게시판 알림";
            default:
                return "🔔 기타 알림";
        }
    };

    // ✅ 알림 드롭다운 메뉴 구성
    const notificationMenu = notifications.length
        ? notifications.map((noti, index) => ({
            key: index,
            label: (
                <div
                    onClick={() => {
                        console.log("🔔 알림 클릭:", noti);
                        // 클릭 시 이동 처리 (type별 라우팅 가능)
                        if (noti.type === "task") navigate("/task/responsible");
                        else if (noti.type === "mail") navigate("/mail/all");
                        else if (noti.type === "board") navigate("/board/1/announcement");
                        else if (noti.type === "taskgroup") navigate("/task/group");
                        // 클릭하면 빨간 점 제거
                        setHasNew(false);

                    }}
                    style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: noti.is_read === "N" ? "#f6f8fa" : "white",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <div style={{ fontWeight: "bold", color: "#333" }}>
                        {getNotiLabel(noti.type)}
                    </div>
                    <div style={{ fontSize: 13, color: "#555" }}>{noti.message}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>
                        {new Date(noti.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })}
                    </div>
                </div>
            ),
        }))
        : [
            {
                key: "empty",
                label: (
                    <div style={{ padding: 12, textAlign: "center", color: "#888" }}>
                        새 알림이 없습니다.
                    </div>
                ),
            },
        ];

    const widgetSetMenu = [
        { label: <div>내용 넣을거면 여기에 render 내용 쓰기1</div>, key: '1' },
        { label: <div>위젯</div>, key: '2' },
        { label: <div>위젯</div>, key: '3' },
    ];

    const fetchUserData = async () => {
        try {
            const memberResp = await caxios.get(`/member/userInfo`);
            const data = memberResp.data;
            //확인할 유저 아이디 불러오기.
            console.log(memberResp);
            console.log(memberResp.data);
            setMemberInfo(prev => {
                const updated = { ...prev };
                Object.keys(data).forEach(key => {
                    if (key in prev) {
                        updated[key] = data[key];
                    }
                });
                return updated;
            });

            if (memberResp.data.profileImage_servName != null) {
                setUserProfile("https://storage.googleapis.com/yj_study/" + memberResp.data.profileImage_servName);
            } else {
                setUserProfile(null);
            }
            setLoading(false);

        } catch (err) {
            console.error(err);
            navigate("/");
            logout();
            return;
        }
    };

    // ✅ 알림 목록 불러오기
    const getNotificationList = async () => {
        try {
            const notiResp = await caxios.get(`/notification`);
            const data = notiResp.data;

            console.log("📬 알림 목록:", data);

            // 응답이 배열 형태라고 가정 (List<NotificationDTO>)
            if (Array.isArray(data)) {
                // 최신순 정렬 (created_at 기준, 혹시 백엔드 정렬이 안되어 있다면)
                const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setNotifications(sorted);
                // 안 읽은 알림이 있으면 빨간 점 표시
                const hasUnread = sorted.some((n) => n.is_read === "N" || n.is_read === "n");
                setHasNew(hasUnread);
            } else {
                console.warn("⚠️ 서버에서 알림 배열이 아닌 응답을 받았습니다:", data);
                setNotifications([]);
            }
        } catch (err) {
            console.error("❌ 알림 목록 불러오기 실패:", err);
            // 토큰 만료나 인증 실패 시 로그아웃 처리
            navigate("/");
            logout();
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }
        fetchUserData();

        const handleNewNotification = (e) => {
            const n = e.detail;
            setNotifications((prev) => [n, ...prev]);
            setHasNew(true);
            console.log(e.detail);
        };

        getNotificationList();
        window.addEventListener("new-notification", handleNewNotification);
        return () => window.removeEventListener("new-notification", handleNewNotification);

    }, []);

    //  로딩 중일 때 렌더링 차단
    if (loading) {
        return null; // 혹은 스켈레톤 화면, 로딩 스피너
    }




    return (
        <div className={styles.header}>
            {/* 왼쪽 끝 */}
            <div className={styles.logo} onClick={() => navigate("/")}>
                <img src={logo} alt="로고" />
                <span>INFINITY</span>
            </div>

            {/* 오른쪽 끝 */}
            <div>
                <Space>
                    {/* 메신저 아이콘 */}
                    <a onClick={e => { e.preventDefault(); openMessenger(); }}>
                        <div className={styles.messengerIcon}>
                            <Send className={styles.sendIcon} />
                        </div>
                    </a>


                    {/* 알림 */}
                    <Dropdown
                        menu={{ items: notificationMenu }}
                        trigger={['click']}
                        onOpenChange={(open) => {
                            if (!open) {
                                // 드롭다운 닫힐 때
                                setHasNew(false);
                            } else {
                                // 열릴 때 최신 리스트 불러오고 읽음 처리
                                getNotificationList();
                                notificationUpdate(); // 서버에 전체 읽음 PUT
                            }
                        }}
                    >
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <div className={styles.noticeContainer}>
                                    <BellOutlined className={styles.noticeIcon} />
                                    {hasNew && <span className={styles.noticeBadge}></span>}
                                </div>
                            </Space>
                        </a>
                    </Dropdown>

                    {/* 프로필 */}
                    <Dropdown menu={{ items: frofileMenu }} trigger={['click']}>
                        <a onClick={e => { e.preventDefault(); fetchUserData(); }}>
                            <Space>
                                {userProfile ? (
                                    <img src={userProfile} alt="프로필 미리보기" className={styles.profileImage} />
                                ) : (
                                    <img src={defaultProfile} alt="프로필 미리보기" style={{ width: "35px", borderRadius: "50%" }} />
                                )}
                            </Space>
                        </a>
                    </Dropdown>

                    {/* 위젯 설정 */}
                    <Dropdown menu={{ items: widgetSetMenu }} trigger={['click']}>
                        <a onClick={e => { e.preventDefault(); fetchUserData(); }}>
                            <Space>
                                <SettingOutlined style={{ fontSize: '28px', color: '#6d6d6dff', marginLeft: '10px', paddingTop: '4px' }} />
                            </Space>
                        </a>
                    </Dropdown>
                </Space>
            </div>
        </div>

    );
};

export default Header;