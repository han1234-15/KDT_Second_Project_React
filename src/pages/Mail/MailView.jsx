import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import styles from "./MailWrite.module.css"; // ✅ MailWrite UI 그대로 사용
import { caxios } from '../../config/config.js';
import { useEffect, useState } from 'react';
import { Button, Input, Space } from "antd";
import TipTapEditor from "../Common/TipTapEditor"; // ✅ 출력 전용

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
        <div className={styles.container} style={{ width: "100%", margin: "auto", marginTop: "20px" }}>
            {/* 상단 버튼 영역 */}
            <div className={styles.btnOption}>
                <Button className={styles.btns} onClick={handleMailReturn}>뒤로가기</Button>
                {!Mailres && (<Button className={styles.btns} onClick={handleMailResponse}>답장</Button>)}
            </div>

            {/* 수신인 영역 */}
            <div className={styles.inputRow}>
                <label className={styles.label}>수신인</label>
                <Space.Compact style={{ width: "80%" }}>
                    <Input
                        type="text"
                        readOnly
                        className={styles.containerhalf}
                        style={{ borderRadius: "6px", backgroundColor: "#f8f9fa" }}
                        value={
                            mail.recipientName && mail.recipientId
                                ? `${mail.recipientName} (${mail.recipientId.includes('@') ? mail.recipientId : `${mail.recipientId}@Infinity.com`})`
                                : mail.recipientName || ""
                        }
                    />
                </Space.Compact>
            </div>

            {/* 제목 영역 */}
            <div className={styles.inputRow}>
                <label className={styles.label}>제목</label>
                <Input
                    type="text"
                    className={styles.containerhalf}
                    readOnly
                    style={{ borderRadius: "6px", backgroundColor: "#f8f9fa" }}
                    value={mail.title}
                />
            </div>

            <hr style={{ width: "96%", marginLeft: "20px" }} />
            {/* 본문 보기 영역 */}
            <div className={styles.mainBody}>
                <div
                    className={styles.mainBodyViewContent}
                    dangerouslySetInnerHTML={{ __html: safeContent }}
                />
            </div>
            <hr style={{ width: "96%", marginLeft: "20px", marginBottom: "20px" }} />
            {/* 파일 업로드 (출력용) */}
            <div className={styles.fileUploadBox}>
                <div className={styles.fileTitle} style={{ width: "8%" }}>파일 첨부</div>
                <div className={styles.fileList} style={{ width: "90%" }}>
                    <ul>
                        {files.map((file, i) => (
                            <li key={i}>
                                {file.orgname || file.sysname}
                                <Button

                                    size="small"
                                    style={{
                                        marginLeft: "10px", background: "linear-gradient(45deg, #8e44ad, #2196f3)", color: "white", border: "none",
                                        display: "flex", justifyContent: "flex-end"
                                    }}
                                    onClick={() => handleDownload(file.sysname, file.orgname)}
                                >
                                    다운로드
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MailView;
