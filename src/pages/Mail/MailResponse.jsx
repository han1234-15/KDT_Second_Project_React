import styles from "./Mail.module.css";
import { caxios } from "../../config/config.js";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal, Input } from "antd"; // ✅ Input 추가
import MailAddContacts from "./MailAddContacts.jsx";
import TiptapEditor from "../Common/TipTapEditor";

const MailResponse = () => {
  const location = useLocation();
  const Navigate = useNavigate();
  const fileRef = useRef();

  const [files, setFiles] = useState([]); // 새로 보내는 파일
  const [originalFiles, setOriginalFiles] = useState([]); // 기존에 받은파일
  const [mail, setMail] = useState({
    user_id: "",
    senderId: "",
    senderName: "",
    recipientId: "",
    recipientName: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    if (location.state) {
      const originalMail = location.state;
      setMail({
        seq: originalMail.seq,
        recipientId: originalMail.senderId,
        recipientName: originalMail.senderName,
        title: `RE: ${originalMail.title}`,
        content: `[원본 메시지]${originalMail.content}`,
        user_id: "",
        senderId: "",
        senderName: "",
      });

      caxios
        .get(`/files/fileList?module_type=mail&module_seq=${originalMail.seq}`)
        .then((res) => setOriginalFiles(res.data))
        .catch((err) => console.error(err));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setMail((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditorChange = (html) =>
    setMail((prev) => ({ ...prev, content: html }));

  const handleFileClick = () => {
    fileRef.current.click();
  };

  const sendTestNotice = async (receiver_id, type, message) => {
    await caxios.post("/notification/send", {
      receiver_id: receiver_id,
      type: type,
      message: message,
      created_at: new Date().toISOString(),
    });
  };

  const handleMailWrite = async () => {
    try {
      const res = await caxios.post("/mail", mail, {
        headers: { "Content-Type": "application/json" },
      });
      const [mailSeq, senderName] = res.data.split("|");

      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append("module_type", "mail");
        formData.append("module_seq", mailSeq);
        Array.from(files).forEach((file) => formData.append("files", file));

        await caxios.post(`/files/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        fileRef.current.value = "";
        setFiles([]);
      }

      if (originalFiles && originalFiles.length > 0) {
        const params = new URLSearchParams();
        params.append("module_type", "mail");
        params.append("module_seq", mailSeq);
        originalFiles.forEach((f) => params.append("existingFiles", f.sysname));

        await caxios.post(`/files/upload/original`, params);
      }

      Navigate("/mail/view", {
        state: {
          mail: { ...mail, seq: mailSeq, originalSeq: mail.seq },
          Mailres: false,
        },
      });

      Navigate("/mail");
      sendTestNotice(
        mail.recipientId,
        "mail",
        `${senderName}님으로부터 답장 메일이 도착했습니다.`
      );
    } catch (err) {
      console.error("메일 발송 중 오류:", err);
      if (err.response && err.response.data) {
        alert(err.response.data);
      } else {
        alert("메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const [Modalcontacts, setModalContacts] = useState(false);

  const [List, setList] = useState([]);

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
    caxios
      .get(`/files/fileList?module_type=mail&module_seq=${mail.seq}`)
      .then((res) => setList(res.data))
      .catch((err) => console.error(err));
  }, [mail]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.replyTitle}>답장</div>
        <div className={styles.actionBtns}>
          <button className={styles.btns} onClick={handleMailWrite}>전송</button>
          <button className={styles.btns} onClick={() => Navigate(-1)}>뒤로가기</button>
        </div>
      </div>

      <hr className={styles.divider}/>
      <div className={`${styles.formRow}`}>
        <label>수신인</label>
        <Input
          className={styles.containerhalf}
          style={{ width:"800px"}}
          onChange={handleChange}
          name="recipientName"
          value={
            mail.recipientName && mail.recipientId
              ? `${mail.recipientName} (${mail.recipientId.includes("@")
                ? mail.recipientId
                : mail.recipientId + "@Infinity.com"
              })`
              : mail.recipientName || ""
          }
          readOnly
        />
      </div>

      <div className={`${styles.formRow}`}>
        <label>제목</label>
        <Input
          className={styles.containerhalf}
          style={{ marginBottom: "20px" ,width:"800px"}}
          onChange={handleChange}
          name="title"
          value={mail.title}
        />
      </div>
      <div className={styles.fileBox}>
        <div className={styles.fileTitle}>첨부파일</div>
        <input
          type="file"
          multiple
          ref={fileRef}
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...selectedFiles]);
          }}
          style={{ marginBottom: "10px", display: "none" }}
        />
        <div className={styles.fileList}>
          <ul>
            {originalFiles.map((file, i) => (
              <li key={i}>
                {file.orgname || file.sysname}
                <button
                  className={styles.btns}
                  onClick={() => handleDownload(file.sysname, file.orgname)}
                >
                  다운받기
                </button>
              </li>
            ))}
          </ul>
          <ul>
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>

        <div className={styles.fileAddBtn}>
          <button
            className={styles.btns}
            onClick={handleFileClick}
          >
            파일 추가
          </button>
        </div>
      </div>
      <div>
        {/* 본문 영역 */}
        <TiptapEditor
          value={mail.content}
          onChange={handleEditorChange}
          moduleType="mail"
          moduleSeq={mail.seq}
        />
      </div>
      <Modal
        centered={false}
        open={Modalcontacts}
        onCancel={() => setModalContacts(false)}
        footer={null}
        destroyOnHidden
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "50%",
        }}
        modalRender={(modal) => <div style={{ marginTop: "100px" }}>{modal}</div>}
      >
        <MailAddContacts
          onSelect={(selectedContacts) => {
            const emailList = selectedContacts.map((c) => c.email).join(", ");
            const nameList = selectedContacts.map((c) => c.name).join(", ");

            setMail((prev) => ({
              ...prev,
              recipientId: emailList,
              recipientName: nameList,
            }));
          }}
          onCancel={() => setModalContacts(false)}
        />
      </Modal>
    </div>
  );
};

export default MailResponse;
