
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import styles from "./Task.module.css";

const TaskGroupAdd = ({ onClose }) => {




    //생성
    const handleAdd = () => {
        onClose();
    }

    //취소
    const handleOut = () => {
        onClose();
    }

    return (


        <div className={styles.container}>

            <div className={styles.mainHeader} style={{ fontSize: "25px" }}>
                업무 그룹 만들기
                <hr></hr>
            </div>

            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>그룹 이름 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                </div>
                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>그룹 설명 </div>

                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                </div>
                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>관리자 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                </div>
                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>공유 대상 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                </div>


            </div>
            <button style={{ float: "right", marginLeft: "10px" }} onClick={handleOut}>취소</button>
            <button style={{ float: "right" }} onClick={handleAdd}>완료</button>


        </div>

    )

}

export default TaskGroupAdd;
