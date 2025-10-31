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
    const handleDownload = async (sysname, orgname) => {
        try {
            const response = await caxios.get(
                `/files/download?sysname=${encodeURIComponent(sysname)}`,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", orgname);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("파일 다운로드 실패:", err);
            alert("파일 다운로드 중 오류가 발생했습니다.");
        }
    };


    useEffect(() => {
        if (!mail || !mail.seq) return;
        caxios.get(`/files/fileList?module_type=mail&module_seq=${mail.seq}`)
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
        <div className={styles.container} style={{ width: "80%", margin: "auto", marginTop: "20px" }}>
            <button className={styles.backBtn} onClick={handleMailReturn} style={{ marginRight: "30px" }}>뒤로가기</button>
            {/* 보낸 메일 답장  */}
            {!Mailres && (<button style={{ float: "right", marginRight: "30px" }} onClick={handleMailResponse}>답장</button>)}
            <div className={styles.mainHeader}>

                <div className={styles.mainHeadertop}>
                    {mail.title}
                </div>
            </div>
            <hr />
            <div className={styles.mainBody} >
                {/* api 받는 문자열  */}
                <div className={styles.mainBodyViewContent} dangerouslySetInnerHTML={{ __html: safeContent }}
                    style={{ fontSize: "25px" }} />



            </div>
            <button className={styles.downloadBtn} style={{ marginRight: "20px" }}>파일 목록</button>
            <br></br>
            <br></br>

            <ul>
                {List.map((e, i) => (

                    <li key={i}>

                        <div>
                            {e.orgname || e.sysname}
                            <button onClick={() => handleDownload(e.sysname, e.orgname)}
                                style={{ marginLeft:"15px" }}>다운받기</button>
                        </div>

                        <br></br>
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default MailView;
