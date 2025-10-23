

import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import styles from "./TaskTabs.module.css";

const TaskResponsibleAdd = ({ onClose }) => {
    const handleAdd = () => onClose();
    const handleOut = () => onClose();

    return (
        <div className={styles.container} style={{ display: "flex", flexDirection: "column", height: "100%", marginTop: "50px" }}>
            <hr />

            <div style={{ display: "flex", flex: 1, overflow: "hidden", marginTop: "20px" }}>
                {/* 크게 왼쪽 */}
                <div style={{ flex: "0 0 60%", paddingRight: "20px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", fontSize: "20px" }}><div>작업 1</div><button>편집</button></div>

                    <div style={{ flex: 1, overflowY: "auto", fontSize: "18px" }}><div>댓글</div><input type="text" placeholder="댓글을 입력하세요" style={{ width: "100%", borderRadius: "10px", marginTop: "10px", padding: "5px" }} /></div>
                </div>
                {/* 크게 오른쪽 */}
                <div style={{ flex: "0 0 40%", paddingLeft: "20px", fontSize: "15px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "30px", width: "50%" }}>
                        <div style={{ marginRight: "50px" }}>상태</div>
                        <select style={{ flex: 1 }}>
                            <option value="대기">대기</option>
                            <option value="진행">진행</option>
                            <option value="완료">완료</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", marginBottom: "30px" }}>
                        <div style={{ width: "80px" }}>텍스트</div>
                        <div>텍스트</div>
                    </div>

                    <div style={{ display: "flex", marginBottom: "30px" }}>
                        <div style={{ width: "80px" }}>날짜</div>
                        <div>2025년 10월 23일 (목)</div>
                    </div>

                    <div style={{ display: "flex", marginBottom: "30px" }}>
                        <div style={{ width: "80px" }}>파일</div>
                        <div>없음</div>
                    </div>

                    <div style={{ display: "flex", marginBottom: "30px" }}>
                        <div style={{ width: "80px" }}>담당자</div>
                        <div>없음</div>
                    </div>


                </div>

            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px" }}>

                <button onClick={handleAdd} style={{ marginLeft: "10px" }}>저장</button>

                <button onClick={handleOut} style={{ marginLeft: "10px" }}>취소</button>

            </div>
        </div>
    );
};

export default TaskResponsibleAdd;
