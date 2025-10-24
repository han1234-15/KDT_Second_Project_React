
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import styles from "./Task.module.css";

//업무 그룹 추가페이지
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


        <div className={styles.container} >

            <div className={styles.mainHeader} style={{ fontSize: "25px" }}>
                <div style={{marginLeft:"10px"}}>
                    업무 그룹 만들기
                </div>

                <hr></hr>
            </div>

            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "20px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ height: "60%" }}>그룹 이름 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ height: "60%", textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginTop: "-20px" }}>그룹 설명 </div>

                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                </div>
                <br></br>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>관리자 </div>
                    <input type="text"
                        style={{
                            width: "20%", height: "60%", textAlign: "left", verticalAlign: "top",
                            color: "black", borderRadius: "5px", border: "1px solid grey", marginTop: "10px", marginLeft: "10px"
                        }} />
                    <button style={{ width: "15%", marginTop: "10px", marginLeft: "10px", fontSize: "15px" }}>+ 추가</button>
                </div>
                <br></br>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>공유 대상 </div>
                    <input type="text"
                        style={{
                            width: "20%", height: "60%", textAlign: "left", verticalAlign: "top",
                            color: "black", borderRadius: "5px", border: "1px solid grey", marginTop: "10px", marginLeft: "10px"
                        }} />
                    <button style={{ width: "15%", marginTop: "10px", marginLeft: "10px", fontSize: "15px" }}>+ 추가</button>
                    <input type="text" placeholder='검색'
                        style={{
                            width: "30%", height: "60%", textAlign: "left", verticalAlign: "top",
                            color: "black", borderRadius: "5px", border: "1px solid grey", marginTop: "10px", marginLeft: "50px"
                        }} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    {/* map하여 공유대상 출력 */}
                </div>

            </div>
            <button style={{ float: "right", marginLeft: "20px" }} onClick={handleAdd}>완료</button>
            <button style={{ float: "right" }} onClick={handleOut}>취소</button>



        </div>

    )

}

export default TaskGroupAdd;
