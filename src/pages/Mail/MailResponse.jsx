import styles from "./Mail.module.css";
import { caxios } from "../../config/config.js";
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Button, Modal } from 'antd';
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
    content: ""
  });

  useEffect(() => {
    if (location.state) {
      const originalMail = location.state;
      // mail 초기값 설정
      setMail({
        seq: originalMail.seq,
        recipientId: originalMail.senderId,
        recipientName: originalMail.senderName,
        title: `RE: ${originalMail.title}`,
        content: `[원본 메시지]${originalMail.content}`,
        user_id: "",
        senderId: "",
        senderName: ""
      });

      // 기존 첨부파일 가져오기
      caxios.get(`/files/fileList?module_type=mail&module_seq=${originalMail.seq}`)
        .then(res => setOriginalFiles(res.data))
        .catch(err => console.error(err));
    }
  }, [location.state]);



  // input 변경 처리
  const handleChange = (e) => {
    setMail(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // CKEditor 내용 변경 처리
  // const handleEditorChange = (event, editor) => {
  //   const data = editor.getData();
  //   setMail(prev => ({ ...prev, content: data }));
  // };

  //tiptap용
  const handleEditorChange = (html) => setMail(prev => ({ ...prev, content: html }));

  // //  CKEditor → TipTap 변경 처리
  // const handleEditorChange = (html) => {
  //   setMail(prev => ({ ...prev, content: html }));
  // };

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

  // 전송 버튼 (답장용)
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

        await caxios.post(`/files/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        }); // 파일 전역 업로드

        fileRef.current.value = "";
        setFiles([]);
      }
      // 기존 파일 복사 (새 메일 seq에 연결)
      if (originalFiles && originalFiles.length > 0) {
        const params = new URLSearchParams();
        params.append("module_type", "mail");
        params.append("module_seq", mailSeq);
        originalFiles.forEach(f => params.append("existingFiles", f.sysname));

        await caxios.post(`/files/upload/original`, params);
      }

      Navigate("/mail/view", { state: { mail: { ...mail, seq: mailSeq, originalSeq: mail.seq }, Mailres: false } });

      Navigate("/mail");
      sendTestNotice(mail.recipientId, "mail", `${senderName}님으로부터 답장 메일이 도착했습니다.`)
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

  // 
  useEffect(() => {
    if (!mail || !mail.seq) return;
    caxios.get(`/files/fileList?module_type=mail&module_seq=${mail.seq}`)
      .then((res) => setList(res.data))
      .catch(err => console.error(err));
  }, [mail]);

  // 기존파일
  useEffect(() => {
    if (location.state) {
      const originalMail = location.state;
      setMail(prev => ({
        ...prev,
        recipientId: originalMail.senderId,
        recipientName: originalMail.senderName,
        title: `RE: ${originalMail.title}`,
        content: `[원본 메시지] ${originalMail.content}`,
        seq: originalMail.seq
      }));

      // 원본 메일 파일 가져오기
      caxios.get(`/files/fileList?module_type=mail&module_seq=${originalMail.seq}`)
        .then(res => setOriginalFiles(res.data))
        .catch(err => console.error(err));
    }
  }, [location.state]);

  return (
    <div className={styles.container} style={{ width: "80%", margin: "auto", marginTop: "20px" }}>
      <div style={{ fontSize: "30px" }} aria-readonly>답장</div>
      <hr></hr>

      <div className={styles.mainHeader} style={{ display: "flex", marginTop: "10px" }}>

        <div style={{ width: "5%", fontSize: "20px" }}>수신인 </div>
        <input type="text" className={styles.containerhalf} style={{ width: "40%", height: "80%", fontSize: "20px", border: "1px solid lightgrey", borderRadius: "5px" }}
          onChange={handleChange} name="recipientName"
          value={
            mail.recipientName && mail.recipientId
              ? `${mail.recipientName} (${mail.recipientId.includes("@") ? mail.recipientId : mail.recipientId + "@Infinity.com"})`
              : mail.recipientName || ""
          }
          readOnly />
      </div>

      <div style={{ display: "flex", marginTop: "10px" }}>
        <div style={{ width: "5%", fontSize: "20px" }}>제목 </div>
        <input type="text" className={styles.containerhalf}
          style={{ width: "40%", fontSize: "20px", border: "1px solid lightgrey", borderRadius: "5px", marginBottom: "20px" }}
          onChange={handleChange} name="title" value={mail.title} />
      </div>

      {/* 본문 영역 */}

      {/* <TipTapEditor
        content={mail.content || ""}
        onChange={handleEditorChange}

      /> */}
      {/* 팁탭에디터 적용해놓음 혹시나 다른 에러 뜨면 ckeditor 써야할듯 */}
      <TiptapEditor
        value={mail.content}
        onChange={handleEditorChange}
        moduleType="mail"
        moduleSeq={mail.seq}
      />
      {/* <CKEditor
        editor={ClassicEditor}
        data={mail.content || ''}
        className={styles.ckEditor}
        onChange={handleEditorChange}
        config={{
          toolbar: [
            'heading', '|', 'bold', 'italic', 'underline', 'link',
            'bulletedList', 'numberedList', '|', 'insertTable',
            'blockQuote', 'undo', 'redo',
          ]
        }}
      /> */}


      <button className={styles.btns} onClick={handleFileClick} style={{ marginTop: "10px", float: "left" }}>파일 추가</button>
      <div style={{ marginTop: "10px", marginLeft: "50px", width: "40%", float: "left" }}>

        <input
          type="file"
          multiple
          ref={fileRef}
          // onChange={(e) => setFiles(e.target.files)}
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
          }}
          style={{ marginBottom: "10px", display: "none" }}
        />



        <h5>첨부 파일</h5>
        <ul>
          {originalFiles.map((file, i) => (
            <li key={i}>
              {file.orgname || file.sysname}
              <button className={styles.btns} onClick={() => handleDownload(file.sysname, file.orgname)}>다운받기</button>
            </li>
          ))}
        </ul>
        <hr></hr>

        <ul>
          {files.map((file, i) => (
            <li key={i}>{file.name}</li>
          ))}
        </ul>
        <hr></hr>
        {/* {files.map((file, idx) => (
          <li key={idx} style={{ marginBottom: "3px" }}>
            {file.name}
          </li>))}

        <button className={styles.downloadBtn} style={{ marginRight: "20px" }}>파일 목록</button>
        <br></br>
        <br></br> */}

        {/* 리스트 5:39분 */}
        {/* <ul>
                {List.map((e, i) => (

                    <li key={i}>

                        <div>
                            {e.orgname || e.sysname}
                            <button onClick={() => handleDownload(e.sysname, e.orgname)}
                                style={{ marginLeft: "15px" }}>다운받기</button>
                        </div>

                        <br></br>
                    </li>
                ))}
            </ul> */}

      </div>

      <button className={styles.btns} onClick={() => Navigate(-1)} style={{ width: "100px", float: "right", marginTop: "10px" }}>뒤로가기</button>

      <button className={styles.btns} style={{ float: "right", marginRight: "30px", marginTop: "10px" }} onClick={handleMailWrite}>전송</button>

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
    </div >


  );
};

export default MailResponse;
