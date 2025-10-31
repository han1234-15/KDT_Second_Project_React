import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/images/logo.png";
import { Avatar, Button, Dropdown, Menu, Space } from "antd";
import { BellOutlined, DownOutlined, LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { caxios } from "../../config/config";
import { Send } from "react-bootstrap-icons";   // ✅ 부트스트랩 아이콘 추가
import defaultProfile from "../../assets/images/defaultProfile.png";

const Header = () => {
    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    const [userProfile,setUserProfile] = useState(null); //프로필용 useState
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
                                {memberInfo.rank_code} / {memberInfo.dept_code}
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

    const notificationMenu = [
        { label: <div>내용 넣을거면 여기에 render 내용 쓰기1</div>, key: '1' },
        { label: <div>알림 드롭다운</div>, key: '2' },
        { label: <div>알림 드롭다운</div>, key: '3' },
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
      
//   useEffect(() => {
//     const token = sessionStorage.getItem("token");

//     if (!token) {
//       navigate("/login");
//       return;
//     }
//     fetchUserData();
//   }, []);

  //  로딩 중일 때 렌더링 차단
//   if (loading) {
//     return null; // 혹은 스켈레톤 화면, 로딩 스피너
//   }

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
                    <Dropdown menu={{ items: notificationMenu }} trigger={['click']}>
                        <a onClick={e => { e.preventDefault(); fetchUserData(); }}>
                            <Space>
                                <BellOutlined style={{ fontSize: '28px', color: '#6d6d6dff', marginRight: '8px' }} />
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
                                    <img src={defaultProfile} alt="프로필 미리보기" style={{width:"35px",borderRadius:"50%"}} />
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