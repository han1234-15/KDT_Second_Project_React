import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/images/logo.png";
import { Avatar, Button, Dropdown, Menu, Space } from "antd";
import { BellOutlined, DownOutlined, LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { caxios } from "../../config/config";

const Header = () => {
    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    const userProfile = useAuthStore(state => state.userProfile);
    const setUserProfile = useAuthStore(state => state.setUserProfile);

    const [memberInfo, setMemberInfo] = useState({
        name: "",
        dept_code: "연구&개발",
        rank_code: "사원",
        officeEmail: "",
    });
    const [loading, setLoading] = useState(true); //로딩 확인용 상태변수


    const handleLogout = (e) => {

        console.log("로그아웃 시도");

        logout();
        // 로그인 로직 추가 예정
    };

    const frofileMenu = [

        {
            label: (
                <div
                    style={{
                        width: 250,
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column', // 전체는 세로 정렬
                        gap: 8,
                    }}
                    className="userInfoPopup"
                    onClick={() => navigate("/mypage")}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* 이미지 */}
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
                                    overflow:'hidden'
                                }}
                            />
                        )}

                        {/* 텍스트 */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 600, marginTop: '25px' }}>{memberInfo.name}</div>
                            <div style={{ fontSize: 15, color: '#666', marginTop: '2px' }}>
                                {memberInfo.rank_code} / {memberInfo.dept_code}
                            </div>
                        </div>
                    </div>

                    {/* 수정 버튼 */}
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

        {
            type: 'divider',
        },
        {
            label: <div onClick={handleLogout} style={{ fontSize: '15px', paddingLeft: '10px' }}><LogoutOutlined style={{ paddingRight: '10px', fontSize: '15px' }} />로그아웃</div>,
            key: '2',
        },
    ];


    const notificationMenu = [
        {
            label: <div>내용 넣을거면 여기에 render 내용 쓰기1</div>,
            key: '1',
        },
        {
            label: <div>알림 드롭다운</div>,
            key: '2',
        },
        {
            label: <div>알림 드롭다운</div>,
            key: '3',
        },
    ];

    const widgetSetMenu = [
        {
            label: <div>내용 넣을거면 여기에 render 내용 쓰기1</div>,
            key: '1',
        },
        {
            label: <div>위젯</div>,
            key: '2',
        },
        {
            label: <div>위젯</div>,
            key: '3',
        },
    ];

    const fetchUserData = async () => {
        try {
            const memberResp = await caxios.get(`/member/userInfo`);

            const data = memberResp.data;

            //확인할 유저 아이디 불러오기.
            console.log(memberResp);
            console.log(memberResp.data);

            setMemberInfo(prev => {
                const updated = { ...prev }; // 기존 상태 복사
                Object.keys(data).forEach(key => {
                    if (key in prev) {
                        updated[key] = data[key]; // 기존 key만 덮어쓰기
                    }
                });
                return updated;
            });

            if (memberResp.data.profileImage_servName != null) {
                setUserProfile("https://storage.googleapis.com/yj_study/" + memberResp.data.profileImage_servName); //이미지 넣는거
            }
            else{
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


    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }
        fetchUserData();
    }, []);


    //토큰을 확인하는데 시간이 걸려서 loading으로 토큰 확인이 끝나기 전까지 다른 컴포넌트가 렌더링 되지 않도록 함.
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
                                    <div className={styles.placeholder}>
                                        <UserOutlined style={{ fontSize: '27px', color: '#6d6d6dff', border: '2px solid #aaa', borderRadius: '50%', overflow: "hidden" }} />
                                    </div>
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