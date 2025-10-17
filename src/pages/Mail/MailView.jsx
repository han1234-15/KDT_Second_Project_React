import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Mail.module.css";

const MailView = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { mail } = location.state || {}; // Mail 객체 받기

    return (
        <div className={styles.container}>
            <div className={styles.mainHeader}>
                <div className={styles.mainHeaderbottom}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>뒤로가기</button>
                    <button className={styles.downloadBtn}>파일 다운로드</button>
                    <br/>
                </div>
                <hr />
                <div className={styles.mainHeadertop}>
                    제목 : {mail.title}
                </div>
            </div>
            <hr />
            <div className={styles.mainBody}>
                내용 : {mail.content}
            </div>
        </div>

    );
};

export default MailView;
