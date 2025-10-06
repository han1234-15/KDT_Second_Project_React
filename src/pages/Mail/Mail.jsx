import styles from "./Mail.module.css";
import { useNavigate, BrowserRouter, Routes, Route, Link } from "react-router-dom";


const Mail = () => {

    const navigate = useNavigate();

    // 메일 클릭 시 이후 만들기
    const handleMailView = () => {
        navigate("mailview"); // 클릭 시 Mailview 페이지로 이동
    };


    const handleMailWrite = () => {

        navigate("mailwrite");


    }

    return (

        <div className={styles.container}>


            {/* 메인창 */}
            <div className={styles.main}>

                {/*  헤더  */}
                <div className={styles.mainHeader}>
                    <div className={styles.mainHeadertag}>보내신 분</div>
                    <div className={styles.mainHeadertag}>제목</div>
                    <div className={styles.mainHeadertag}>이메일</div>
                    <div className={styles.mainHeadertag}>팀</div>
                    <div className={styles.mainHeadertag}>직급</div>
                </div> {/* 헤더  */}


                {/* 바디 여기가 계속 변하는곳 Route */}
                <div className={styles.mainBody} onClick={handleMailView}>

                    {/* 메일 출력  */}
                    <div className={styles.mainBodybox}>
                        <div className={styles.mainBodytag}>박민규</div>
                        <div className={styles.mainBodytag}>안녕하세요 대리님!</div>
                        <div className={styles.mainBodytag}>pwrmin@naver.com</div>
                        <div className={styles.mainBodytag}>마케팅1팀</div>
                        <div className={styles.mainBodytag}>사원</div>
                    </div>
                </div>  {/* 바디 */}

            </div> {/* 메인창  */}

            {/* 오른쪽 바 */}
            <div className={styles.rightbar}>

                {/* bar 헤더 */}
                <div className={styles.rightbarHeader}>
                    {/* 메일 추가 */}
                    <button className={styles.createbtn} onClick={handleMailWrite}> 메일 쓰기 </button>
                </div>

                {/* 주소록 bar 바디 */}
                <div className={styles.rightbarBody}>

                    {/* 주소록 종류 출력  */}
                    <div className={styles.rightbarBodytag}> 전체 메일함 </div>
                    <div className={styles.rightbarBodytag}>받은 메일함 </div>
                    <div className={styles.rightbarBodytag}> 보낸 메일함 </div>

                </div>

            </div>


        </div>








    );
}

export default Mail;