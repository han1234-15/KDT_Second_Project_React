import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import styles from "./Mail.module.css";
import { caxios } from '../../config/config.js';
import { useEffect, useState } from 'react';

const MailView = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { mail, Mailres } = location.state || {}; // Mail 객체 받기
    const [originalFiles, setOriginalFiles] = useState([]); // 답장받을시 기존에 받은파일
    const [mailState, setMailState] = useState(mail || {});
    const handleMailReturn = () => {
        navigate(-1);
    }
    // MailView

    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            let origFiles = [];
            let addFiles = [];

            if (mail.originalSeq) {
                origFiles = (await caxios.get(`/files/fileList?module_type=mail&module_seq=${mail.originalSeq}`)).data;
            }

            if (mail.seq) {
                addFiles = (await caxios.get(`/files/fileList?module_type=mail&module_seq=${mail.seq}`)).data;
            }

            setFiles([...origFiles, ...addFiles]);
        };

        fetchFiles();
    }, [mail]);




    // const [addedFiles, setAddedFiles] = useState([]);

    // // 원본 파일 불러오기
    // useEffect(() => {
    //   if (mail.originalSeq) { // location.state에 originalSeq 있으면
    //     caxios.get(`/files/fileList?module_type=mail&module_seq=${mail.originalSeq}`)
    //       .then(res => setOriginalFiles(res.data))
    //       .catch(err => console.error(err));
    //   }
    // }, [mail]);


    //     // 답장 후 원본 파일 출력 (view용)
    //     useEffect(() => {
    //         if (location.state) {
    //             const originalMail = location.state;
    //             setMailState(prev => ({
    //                 ...prev,
    //                 seq: originalMail.seq,
    //                 recipientId: originalMail.senderId,
    //                 recipientName: originalMail.senderName,
    //                 title: `RE: ${originalMail.title}`,
    //                 content: `[원본 메시지]${originalMail.content}`
    //             }));
    //             // 원본 메일 첨부파일 가져오기
    //             caxios.get(`/files/fileList?module_type=mail&module_seq=${originalMail.seq}`)
    //                 .then(res => setOriginalFiles(res.data))
    //                 .catch(err => console.error(err));
    //         }
    //     }, [location.state]);

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

    // 기존
    // useEffect(() => {
    //     if (!mail || !mail.seq) return;
    //     caxios.get(`/files/fileList?module_type=mail&module_seq=${mail.seq}`)
    //         .then((res) => setList(res.data))
    //         .catch(err => console.error(err));
    // }, [mail]);



    if (!mail) return <div>메일 정보를 불러오는 중입니다...</div>;



    // 안전하게 HTML 정화 npm install dompurify 필요
    const safeContent = DOMPurify.sanitize(mail.content);

    // 답장기능
    const handleMailResponse = () => {
        navigate("/mail/response", { state: mail });
    }

    return (
        <div className={styles.container} style={{ width: "80%", margin: "auto", marginTop: "20px" }}>

            <div className={styles.mainHeader}>

                <div className={styles.mainHeadertop}>
                    제목 :  {mail.title}
                                </div>

                {Mailres && (<div style={{ marginRight: "20px" }}>
                    발신 날짜 : {mail.sendDateStr}
                </div>)}

                {!Mailres && (<div style={{ marginRight: "20px" }}>
                    수신 날짜 : {mail.sendDateStr}
                </div>)}

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

            <h4>첨부파일</h4>
            <ul>
                {files.map((file, i) => (
                    <li key={i}>
                        {file.orgname || file.sysname}
                        <button onClick={() => handleDownload(file.sysname, file.orgname)}>다운받기</button>
                    </li>
                ))}
            </ul>



            <button className={styles.backBtn} onClick={handleMailReturn} style={{ marginRight: "30px" }}>뒤로가기</button>
            {/* 보낸 메일 답장  */}
            {!Mailres && (<button style={{ float: "right", marginRight: "30px" }} onClick={handleMailResponse}>답장</button>)}
        </div>

    );
};

export default MailView;
