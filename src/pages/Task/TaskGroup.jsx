import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import TaskGroupAdd from './TaskGroupAdd.jsx';
import styles from "./Task.module.css";
import TaskDataAdd from './TaskDataAdd.jsx';
import { FaUser } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";

//업무 그룹 페이지
const TaskGroup = () => {

    const navigate = useNavigate();
    //그룹 목록 상태
    const [groups, setGroups] = useState([]);

    // 그룹 목록 불러오기 함수
    const fetchGroups = () => {
        caxios
            .get("/task/groups")
            .then((resp) => {
                setGroups(resp.data);
                console.log("그룹 목록:", resp.data);
            })
            .catch((err) => console.error(err));
    };

    // 그룹 목록 불러오기
    useEffect(() => {
        fetchGroups();
    }, []);

    // 그룹 클릭 시 페이지 이동
    const handleNavigate = (seq) => {
        navigate(`/task/group/${seq}`); // 예: 상세페이지로 이동
    };


    // modal
    // 업무 그룹 추가
    const [TaskGroupAddOpen, setTaskGroupAddOpen] = useState(false);

    const showTaskGroupAdd = () => {
        setTaskGroupAddOpen(true);
    };

    // 데이터 등록
    const [TaskDataAddOpen, setTaskDataAddOpen] = useState(false);

    const showTaskDataAdd = () => { // 데이터 등록
        setTaskDataAddOpen(true);
    };


    return (
        <div className={styles.container}>
            {groups.length === 0 ? (
                "없음"
            ) : (
                groups.map((group) => (
                    <button
                        key={group.SEQ}
                        className={styles.groupBtn}
                        onClick={() => handleNavigate(group.SEQ)}
                    >
                        {/* 대문자로 넘어와서 변수 대문자로 함.. */}
                        <div className={styles.groupName}>{group.GROUP_NAME}</div>
                        <div className={styles.description}>{group.DESCRIPTION}</div>
                        <div className={styles.groupDesc}>관리자 : {group.MANAGER_NAME}</div>
                        <div className={styles.groupMemberCount}><FaUser style={{ marginBottom: "3px" }} />  : {group.membersCount} 명</div>
                    </button>
                ))

            )
            }
            <button className={styles.groupBtn} onClick={showTaskGroupAdd} style={{color:"#939393ff"}}><CiCirclePlus style={{color:"#e9e9e9ff",fontSize:"100px",display:"block",}}/>업무 그룹 추가 </button>
            <button className={styles.groupBtn} onClick={showTaskDataAdd}> 데이터 추가 </button>

            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>


                    {/* 업무 그룹 추가 modale */}
                    <Modal

                        centered={false}
                        open={TaskGroupAddOpen}
                        onCancel={() => setTaskGroupAddOpen(false)}
                        footer={null}
                        destroyOnHidden
                        width={{
                            xs: '90%',  // 모바일
                            sm: '80%',
                            md: '70%',
                            lg: '60%',
                            xl: '50%',
                            xxl: '30%', // 큰 화면
                        }}
                        style={{ top: 100, marginTop: '50px' }}

                    >
                        <TaskGroupAdd onClose={() => {setTaskGroupAddOpen(false);  fetchGroups(); }} />
                    </Modal>


                    {/* (임시)데이터 등록 modale */}

                    <Modal

                        centered={false}
                        open={TaskDataAddOpen}
                        onCancel={() => setTaskDataAddOpen(false)}
                        footer={null}
                        destroyOnHidden
                        width={{
                            xs: '90%',  // 모바일
                            sm: '80%',
                            md: '70%',
                            lg: '60%',
                            xl: '50%',
                            xxl: '70%', // 큰 화면
                        }}
                        style={{ top: 100, height: '100px', marginTop: '3%' }}

                    >
                        <TaskDataAdd onClose={() => setTaskDataAddOpen(false)} />

                    </Modal>


                </div>

            </div>


        </div>



    );


}

export default TaskGroup;