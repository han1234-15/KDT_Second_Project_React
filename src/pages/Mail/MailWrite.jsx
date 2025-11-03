import styles from "./MailWrite.module.css";
import { caxios } from "../../config/config.js";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Modal, Input, Space } from 'antd'; // ✅ Ant Design Input & Button 추가
import MailAddContacts from "./MailAddContacts";
import { useLocation } from "react-router-dom";
import TipTapEditor from "../Common/TipTapEditor"; // ✅ TipTap 컴포넌트로 교체
const { TextArea } = Input;

const MailWrite = () => {

  const location = useLocation();

  const Navigate = useNavigate();
  const fileRef = useRef();
  const [files, setFiles] = useState([]);

  const [mail, setMail] = useState({
    user_id: "",
    senderId: "",
    senderName: "",
    recipientId: "",
    recipientName: "",
    title: "",
    content: ""
  });

  useEffect(() => {
    if (location.state?.selectedContacts) {
      const selectedContacts = location.state.selectedContacts;
      setMail(prev => ({
        ...prev,
        recipientId: selectedContacts.map(c => c.email).join(", "),
        recipientName: selectedContacts.map(c => c.name).join(", "),
      }));
    }
  }, [location.state]);


  // input 변경 처리
  const handleChange = (e) => {
    setMail(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  //  CKEditor → TipTap 변경 처리
  const handleEditorChange = (html) => {
    setMail(prev => ({ ...prev, content: html }));
  };

  const handleFileClick = () => {
    fileRef.current.click();
  }
  //알람
  const sendTestNotice = async (receiver_id, type, message) => {
    await caxios.post("/notification/send", {
      receiver_id: receiver_id, // 실제 로그인 ID로 전달받을 사람.
      type: type,
      message: message,
      created_at: new Date().toISOString(),
    }); 
    //alert("테스트 알림 전송 완료 ✅");
  };

  // // 전송 버튼
  const handleMailWrite = async () => {
    try {
      const res = await caxios.post("/mail", mail, {
        headers: { "Content-Type": "application/json" }
      });

      const [mailSeq, senderName] = res.data.split("|");
      // const mailSeq = res.data; // MailController에서 seq 반환

      if (files && files.length > 0) {

        const formData = new FormData();
        // form.append('mailSeq', mailSeq); // 기존 파일 보내는 mail seq (mailSeq 포함)
        formData.append("module_type", "mail"); // 10.31 파일 전역
        formData.append("module_seq", mailSeq); // 10.31 파일 전역

        Array.from(files).forEach(file => formData.append('files', file));

        // await caxios.post(`/file/mailSeq`, formData, {
        //   headers: { "Content-Type": "multipart/form-data" }
        // });  // 기존 파일 업로드

        await caxios.post(`/files/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        }); // 파일 전역 업로드

        fileRef.current.value = "";
        setFiles([]);
      }
      Navigate("/mail");
      // 알람
      sendTestNotice(mail.recipientId, "mail", `${senderName}님으로 부터 메일이 도착했습니다.`)
    } catch (err) {
      console.error("메일 발송 중 오류:", err);

      // 서버에서 보낸 메시지
      if (err.response && err.response.data) {
        alert(err.response.data);
      } else {
        alert("메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };


  // MODAL

  const [Modalcontacts, setModalContacts] = useState(false);

  // 수신자(주소록에서) 추가
  const handleAddContacts = () => {
    setModalContacts(true);
  };


  return (
    <div className={styles.container} style={{ width: "100%", margin: "auto", marginTop: "20px" }}>
      {/* 상단 버튼 영역 */}
      <div className={styles.btnOption}>
        <Button className={styles.btns} onClick={() => Navigate(-1)}>뒤로가기</Button>
        <Button className={styles.btns} type="primary" onClick={handleMailWrite}>전송</Button>
      </div>

      {/* 수신인 영역 */}
      <div className={styles.inputRow}>
        <label className={styles.label}>수신인</label>
        <Space.Compact style={{ width: "80%" }}>
          <Input
            type="text"
            className={styles.containerhalf}
            placeholder="주소록에서 추가해주세요"
            readOnly
            onChange={handleChange}
            style={{ borderRadius: "6px" }}
            name="recipientName"
            value={
              mail.recipientName && mail.recipientId
                ? `${mail.recipientName} (${mail.recipientId.includes("@") ? mail.recipientId : mail.recipientId + "@Infinity.com"})`
                : mail.recipientName || ""
            }
          />
          <Button onClick={handleAddContacts} style={{ marginLeft: "20px", borderRadius: "6px" }}>주소록</Button>
        </Space.Compact>
      </div>

      {/* 제목 입력 */}
      <div className={styles.inputRow}>
        <label className={styles.label}>제목</label>
        <Input
          type="text"
          className={styles.containerhalf}
          placeholder="제목을 입력하세요"
          onChange={handleChange}
          name="title"
          value={mail.title}
        />
      </div>

      {/* 파일 업로드 */}
      <div className={styles.fileUploadBox}>
        <div className={styles.fileTitle}>파일 첨부</div>
        <div className={styles.fileList}>
          <input
            type="file"
            multiple
            ref={fileRef}
            style={{ display: "none" }}
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files);
              setFiles(prev => [...prev, ...selectedFiles]);
            }}
          />
          {files.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </div>
        <Button onClick={handleFileClick}>파일 추가</Button>
      </div>

      {/* 본문 영역 */}
      <div className={styles.mainBody}>
        <TipTapEditor
          content={mail.content || ""}
          onChange={handleEditorChange}
        />
      </div>

      {/* 주소록 모달 */}
      <Modal
        centered={false}
        open={Modalcontacts}
        onCancel={() => setModalContacts(false)}
        footer={null}
        destroyOnHidden
        width={{
          xs: '90%',  // 모바일
          sm: '80%',
          md: '70%',
          lg: '60%',
          xl: '50%',
          xxl: '50%', // 큰 화면
        }}
        modalRender={modal => (
          <div style={{ marginTop: '100px' }}> {/* 상단에서 50px 아래 */}
            {modal}
          </div>
        )}
      >
        <MailAddContacts
          onSelect={selectedContacts => {
            const emailList = selectedContacts.map(c => c.email).join(", ");
            const nameList = selectedContacts.map(c => c.name).join(", ");

            setMail(prev => ({
              ...prev,
              recipientId: emailList,
              recipientName: nameList
            }));
          }}
          onCancel={() => setModalContacts(false)}
        />
      </Modal>
    </div>
  );
};

export default MailWrite;
