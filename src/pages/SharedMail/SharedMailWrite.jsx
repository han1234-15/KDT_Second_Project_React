import React from "react";
import styles from "./SharedMail.module.css";

const SharedMailWrite = () => {
    return (

        <div className={styles.container}>

            <div className={styles.mainHeader} style={{ fontSize: "40px", backgroundColor: "#007bff", color: "white" }}>
                새로운 공용메일 생성
            </div>

            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>편지함 이름 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>발신자 이름 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }} />
                </div>


                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>용도 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>메일 주소 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>요청 사유: </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>

                <div className={styles.mainHeader}>
                    <div className={styles.mainHeadertag}>이름</div>
                    <div className={styles.mainHeadertag}>이메일</div>
                    <div className={styles.mainHeadertag}>전화번호</div>
                    <div className={styles.mainHeadertag}>팀</div>
                    <div className={styles.mainHeadertag}>직급</div>
                </div> 


                <button style={{ float: "right", marginLeft: "10px" }}>취소</button>   <button style={{ float: "right" }}>생성</button>

            </div>


        </div>


    );
};

export default SharedMailWrite;
