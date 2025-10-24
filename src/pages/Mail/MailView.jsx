import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import styles from "./Mail.module.css";
import { caxios } from '../../config/config.js';
import { useEffect, useState } from 'react';

const MailView = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { mail, Mailres } = location.state || {}; // Mail 객체 받기

    const handleMailReturn = () => {
        navigate(-1);
    }


    // 파일 리스트 출력
    const [List, setList] = useState([]);

    // 파일 다운    
    const handleDownload = async (mailSeq, sysname, orgname) => {
        try {
            const res = await caxios.get(`/file/download?mailSeq=${mailSeq}&sysname=${sysname}`, {
                responseType: 'blob'  // 중요!
            });

            // 브라우저에서 파일 다운로드
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', orgname); // 실제 파일명 사용
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        if (!mail || !mail.seq) return;
        caxios.get(`/file/mail?mailSeq=${mail.seq}`)
            .then((res) => setList(res.data))
            .catch(err => console.error(err));
    }, [mail]);



    if (!mail) return <div>메일 정보를 불러오는 중입니다...</div>;



    // 안전하게 HTML 정화 npm install dompurify 필요
    const safeContent = DOMPurify.sanitize(mail.content);

    // 답장기능
    const handleMailResponse = () => {
        navigate("/mail/response", { state: mail });
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainHeader}>
                <div className={styles.mainHeadertop}>
                    {mail.title}
                </div>
                <hr />
            </div>

            <div className={styles.mainBody}>
                <div className={styles.mainBodyViewContent} dangerouslySetInnerHTML={{ __html: safeContent }} />

                <button className={styles.downloadBtn} style={{ marginRight: "20px" }}>파일 목록</button>
                <br></br>
                <br></br>

                <ul>

                    {List.map((e, i) => (

                        <li key={i} style={{ width: "20%" }}>

                            {e.orgname || e.sysname}
                            <button onClick={() => handleDownload(mail.seq, e.sysname, e.orgname)}
                                style={{ marginLeft: "20px" }}>다운받기</button>
                            <hr></hr>

                        </li>
                    ))}
                </ul>

            </div>
            <button className={styles.backBtn} onClick={handleMailReturn} style={{ marginRight: "50px" }}>뒤로가기</button>
            {/* 보낸 메일은 답장 기능 */}
            {!Mailres && (<button style={{ float: "right", marginRight: "40px" }} onClick={handleMailResponse}>답장</button>)}
        </div>

    );
};

export default MailView;
