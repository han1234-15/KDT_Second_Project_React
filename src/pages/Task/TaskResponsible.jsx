import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import styles from "./TaskTabs.module.css";
import TaskResponsibleAdd from './TaskResponsibleAdd.jsx';


// 담당 업무 페이지
const TaskResponsible = () => {
    // modal
    // 업무 그룹 추가
    const [TaskResponsibleAddOpen, setTaskResponsibleAddOpen] = useState(false);

    const showTaskResponsibleAddOpen = () => { 
        setTaskResponsibleAddOpen(true);
    };


    return (

        <div className={styles.container}>

            <div className={styles.mainHeader} style={{ fontSize: "25px" }}>

            </div>

            <div className={styles.mainBody}>

                <div className={styles.mainBodyHeader}>

                    <div>데이터 / 상태 / 등록일 </div>
                    <hr></hr>

                    <div>
                        <a onClick={showTaskResponsibleAddOpen} style={{ cursor: "pointer" }}>프로젝트 / </a>

                        <select style={{ width: "5%", marginLeft: "10px" }}>
                            <option value="대기">대기</option>
                            <option value="진행">진행</option>
                            <option value="완료">완료</option>
                        </select>
                        /
                        2025.??.??
                    </div>


                </div>

                <Modal

                    centered={false}
                    open={TaskResponsibleAddOpen}
                    onCancel={() => setTaskResponsibleAddOpen(false)}
                    footer={null}
                    destroyOnHidden
                    width="60%"
                    style={{ top: 100, height: '100px', marginTop: '3%' }}
                    bodyStyle={{ height: '700px' }}
                >
                    <TaskResponsibleAdd onClose={() => setTaskResponsibleAddOpen(false)} />
                </Modal>
            </div>


        </div >

    );
}

export default TaskResponsible;