import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";
import { Button, Modal } from 'antd';
import styles from "./TaskTabs.module.css";


// 작업 추가 페이지
const TaskResponsibleAdd = ({ onClose }) => {


    //생성
    const handleAdd = () => {
        onClose();
    }

    //취소
    const handleOut = () => {
        onClose();
    }

    return (



        <div className={styles.container} style={{ marginTop: "50px", width: "100%", height: "100%" }}>

            <hr></hr>
            {/* 크게 왼쪽 부분 */}
            <div style={{ width: "60%", height: "100%", float: "left" }}>

                {/* 왼쪽 위 작업 */}
                <div style={{ width: "100%", height: "30%", float: "left", fontSize: "20px", marginBottom: "30px" }}>

                    <div style={{ width: "100%", height: "40%", float: "left" }}>
                        <div style={{ width: "60%", height: "100%", float: "left", fontSize: "30px", marginLeft: "10px" }}>작업 칸</div>

                        <div style={{ width: "20%", height: "100%", float: "right" }}><button>편집</button></div>
                    </div>
                    <hr style={{ clear: "both", border: "1px solid black" }} />
                    <div style={{ width: "100%", height: "60%", float: "left" }}>
                        2차 프로젝트 작업 중 <br></br>
                        팀원들 모두 화이팅!

                    </div>

                </div>
                <hr style={{ clear: "both", border: "1px solid black" }} />

                {/* 왼쪽 아래 댓글 */}
                <div style={{ width: "100%", height: "70%", float: "left" }}>

                    <div style={{ width: "100%", float: "left", fontSize: "20px" }}>

                        <div style={{ marginBottom: "30px", fontSize: "30px", marginLeft:"10px" }}>댓글 칸</div>

                        <div>
                            <input type='text' placeholder='댓글을 입력하세요'
                                style={{ width: "60%", borderRadius: "10px", float: "left", marginBottom: "30px" }} />
                        </div>

                        <input type='text' placeholder='댓글을 입력하세요'
                            style={{ width: "60%", borderRadius: "10px", float: "left", marginBottom: "30px" }} />

                    </div>
                </div>

            </div>


            {/* 크게 오른쪽 부분 */}
            <div style={{ width: "40%", height: "100%", float: "left", fontSize: "15px", borderLeft: "1px solid black" }}>

                <div style={{ width: "100%", float: "left", marginBottom: "20px" }}>
                    <div style={{ width: "15%", height: "100%", float: "left", marginTop: "30px", textAlign: "center", fontSize: "20px" }}>상태 </div>

                    <select style={{ width: "20%", marginTop: "30px", marginLeft: "10%" }}>
                        <option value="대기">대기</option>
                        <option value="진행">진행</option>
                        <option value="완료">완료</option>
                    </select>
                </div>

                <div style={{ width: "100%", float: "left" }}>
                    <div style={{ width: "15%", float: "left", textAlign: "center", fontSize: "20px" }}>텍스트 </div>
                    <div style={{ width: "65%", float: "left", marginLeft: "10%", marginBottom: "20px" }}>텍스트1 </div>
                </div>


                <div style={{ width: "15%", float: "left", textAlign: "center", fontSize: "20px" }}>날짜 </div>
                <div style={{ width: "65%", float: "left", marginLeft: "10%", marginBottom: "20px" }}>2025년 10월 24일 (금) </div>


                <div style={{ width: "15%", float: "left", textAlign: "center", fontSize: "20px" }}>파일 </div>
                <div style={{ width: "65%", float: "left", marginLeft: "10%", marginBottom: "20px" }}>없음 </div>


                <div style={{ width: "15%", float: "left", textAlign: "center", fontSize: "20px" }}> 담당자 </div>
                <div style={{ width: "65%", float: "left", marginLeft: "10%", marginBottom: "20px" }}> 없음 </div>

                <div style={{ position: "absolute", bottom: "30px", right: "50px" }}>
                    <button style={{ marginLeft: "20px" }} onClick={handleAdd}>저장</button>
                    <button style={{ marginLeft: "20px" }} onClick={handleOut}>취소</button>
                </div>
            </div>


        </div>



    );


}

export default TaskResponsibleAdd;
