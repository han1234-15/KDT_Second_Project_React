import styles from "./Mail.module.css";
import { useNavigate, BrowserRouter, Routes, Route, Link } from "react-router-dom";


const MailSent = () => {

    const navigate = useNavigate();

    // 메일 클릭 시 이후 만들기
    const handleMailView = () => {
        navigate("/mail/mailview"); // 클릭 시 Mailview 페이지로 이동
    };

    // 메일 쓰기로 이동
    const handleMail = () => {

        navigate("/mail");


    }




    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>



                {/* 주소록 헤더 1 */}
                <div className={styles.mainHeadertop} >
                    보낸 메일 0/0 <br />
                    <button onClick={handleMail}>받은 메일함</button>
                </div>

                {/* 주소록 헤더 2 */}
                <div className={styles.mainHeaderbottom} >

                    <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                        <label style={{ marginTop: "15px" }}>
                            <input type="checkbox" /> 모든 메일
                        </label>
                        <label style={{ marginTop: "15px" }}>
                            <input type="checkbox" /> 중요 메일
                        </label>
                    </div>

                </div>


            </div> {/* 주소록 헤더  */}
            <hr></hr>

            {/* 주소록 바디 여기가 계속 변하는곳 Route */}
            <div className={styles.mainBody}>

                <div className={styles.mainBodyHeader}>

                    <div className={styles.mainBodytag}>수신인</div>
                    <div className={styles.mainBodytagTitle}>제목</div>
                    <div className={styles.mainBodytag}>수신날짜</div>
                    <div className={styles.mainBodytag}>첨부파일</div><br></br>
                </div>
                <hr></hr>

                {/* 주소록 출력  */}
                <div className={styles.mainBodylist}>

                    <div className={styles.mainBodylistbox} onClick={handleMailView} >
                        <div className={styles.mainBodytag}>박민규</div>
                        <div className={styles.mainBodytagTitle}>메일 드립니다.</div>
                        <div className={styles.mainBodytag}>2025.01.14</div>
                        <div className={styles.mainBodytag}> X </div>
                    </div>
                </div>

            </div>  {/* 주소록 바디 */}

        </div> {/* 메인 주소록창  */}


    </div>



    );




}

export default MailSent;