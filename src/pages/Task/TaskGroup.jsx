import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import TaskGroupAdd from './TaskGroupAdd.jsx';
import styles from "./Task.module.css";
import TaskDataAdd from './TaskDataAdd.jsx';

//업무 그룹 페이지
const TaskGroup = () => {


    // modal
    // 업무 그룹 추가
    const [TaskGroupAddOpen, setTaskGroupAddOpen] = useState(false);

    const showTaskGroupAdd = () => { // 개인 주소록 추가
        setTaskGroupAddOpen(true);
    };

    // 데이터 등록
    const [TaskDataAddOpen, setTaskDataAddOpen] = useState(false);

    const showTaskDataAdd = () => { // 데이터 등록
        setTaskDataAddOpen(true);
    };


    return (
        <div className={styles.container}>

            <div className={styles.mainHeader} >
            </div>
            <button onClick={showTaskGroupAdd}> 업무 그룹 추가 </button>
            <button onClick={showTaskDataAdd}> 데이터 추가 </button>
            <br></br>
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
                        style={{ top: 100, height: '500px', marginTop: '100px' }}
                        bodyStyle={{ height: '600px' }}
                    >
                        <TaskGroupAdd onClose={() => setTaskGroupAddOpen(false)} />
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