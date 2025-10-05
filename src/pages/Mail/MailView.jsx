import { useParams, useNavigate } from "react-router-dom";
import styles from "./Mail.module.css";

const MailView = () => {

    const navigate = useNavigate();

    return (
        <div className={styles.container}>

            <div className={styles.mainHeader}>
                제목 :안녕하세요 대리님! ~$#@$@#$@#

            </div>


            <div className={styles.mainBody}>

                내용 : 오늘도 편안한 하루되세요 4567456456

            </div>
            <button> 첨부파일 다운로드</button> <br></br>

            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                ← 뒤로가기
            </button>
        </div>

    );
};

export default MailView;
