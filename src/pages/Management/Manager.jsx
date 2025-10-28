import style from './Manager.module.css'
import { useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { Button, Flex, Table, Modal } from 'antd';
import { caxios } from '../../config/config';
import { AiOutlineSearch } from "react-icons/ai";



const Manager = () => {

    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState(0); //그룹웨어 사용 인원
    const [search, setSearch] = useState('');

    const navigate = useNavigate();
    // 모달용 상태 추가
    const [openModal, setOpenModal] = useState(null);
    // null | 'delete' | 'empType' | 'dept' | 'rank' | 'job'
    const [adminId, setAdminId] = useState(null); // 

    const getAdminList = () => {
        caxios.get('/admin') // 서버에서 어드민 리스트 불러오기
            .then(resp => {
                setUsers(resp.data); // 서버에서 JSON 배열로 받는다고 가정
                setUserCount(resp.data.length);
                console.log(resp.data);
            })
            .catch(err => {
                console.error('사용자 목록 가져오기 실패', err);
            });
    }

    useEffect(() => {
        getAdminList();
    }, []);

    const handleDelete = async (userId) => {

        const fetchUserData = async () => {
            try {
                await caxios.get("/auth/check");
                //관리자인지 체크 먼저하고
            } catch (err) {
                console.error(err);
                navigate("/");
                return;
            }
        };

        try {
            await fetchUserData();
            await caxios.delete("/admin", { data: { id: userId } });

            alert("관리자 삭제 성공");
            getAdminList();
        } catch (err) {
            console.log(err.response?.data || err.message);  // 관리자 삭제 실패;
            alert("관리자 삭제 실패");
        }
    };


    const columns = [
        { title: '이름(아이디)', dataIndex: 'name', key: 'name', render: (_, record) => `${record.name} (${record.id})` },
        { title: '부서', dataIndex: 'dept_code', key: 'dept_code' },
        { title: '등록일', dataIndex: 'created_time', key: 'created_time' },
        {
            title: '관리', key: 'action', render:
                (_, record) => (
                    <Button type="primary" danger onClick={() => handleDelete(record.id)}>삭제</Button>
                )
        },
    ];

    const filteredUsers = users
        .filter(user =>
            user.name.includes(search) ||
            user.id.includes(search)
        )
        .map(user => ({ ...user, key: user.id })); // key 추가

    const closeModal = () => {
        if (openModal === 'admin') setAdminId(null);
        setOpenModal(null);
    }

    // admin 추가
    const addAdmin = async () => {

        if (adminId == null || adminId == "") {
            alert("추가할 관리자의 ID를 입력해주세요");
            return;
        }

        try {
            await caxios.post('/admin', {
                id: adminId
            });
            alert("관리자 등록 성공");
            getAdminList();
            closeModal();
        } catch (err) {
            console.log(err.response?.data || err.message);   // "존재하지 않는 ID 입니다."
            alert("관리자 등록 실패");

        }
    };

    const handleClick = (e) => {
        const { name } = e.currentTarget;
        setOpenModal(name); // 체크박스 클릭했을 때 나오는 버튼 중 어떤 버튼 눌렀는지 저장
    };

    return (
        <div className={style.container}>

            <div>
                <h4>
                    관리자 현황 {userCount}명
                </h4>

                <div >
                    <Flex gap="middle" vertical>
                        <Flex align="center" gap="middle">
                            <div className={style.searchLine}>
                                <button className={style.addBtn} name="admin" onClick={handleClick}>관리자 등록</button>

                                <div className={style.searchBox}>
                                    <AiOutlineSearch style={{ fontSize: '20px', color: '#ddddddff', marginRight: '5px' }} />
                                    <Input
                                        type="text"
                                        placeholder="검색 (이름, ID, 사번)"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        variant="borderless"
                                        style={{ width: '100%', border:'none'}}
                                    />
                                </div>
                            </div>
                        </Flex>

                        <Table className={style.table} columns={columns} dataSource={filteredUsers} pagination={{ position: ['bottomCenter'], hideOnSinglePage: true }} />
                    </Flex>

                    <Modal
                        title="관리자 등록"
                        open={openModal === 'admin'}
                        onOk={() => {
                            console.log('관리자 등록 실행');
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => addAdmin()}>
                                등록
                            </Button>
                        ]}

                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr />
                        <Input
                            placeholder="추가할 관리자의 ID를 입력하세요"
                            value={adminId}
                            onChange={e => setAdminId(e.target.value)}
                        />
                    </Modal>
                </div>
            </div>
        </div>


    );
}

export default Manager;