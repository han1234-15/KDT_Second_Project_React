  import styles from "./Mail.module.css";
  import { caxios } from "../../config/config.js";
  import { useState, useRef, useEffect } from 'react';
  import { useNavigate } from "react-router-dom";
  import { CKEditor } from '@ckeditor/ckeditor5-react';
  import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
  import { Button, Modal } from 'antd';
  import MailAddContacts from "./MailAddContacts";


  const MailWrite = () => {



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



    // input 변경 처리
    const handleChange = (e) => {
      setMail(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // CKEditor 내용 변경 처리
    const handleEditorChange = (event, editor) => {
      const data = editor.getData();
      setMail(prev => ({ ...prev, content: data }));
    };

    const handleFileClick = () => {
      fileRef.current.click();
    }


    // // 전송 버튼
    const handleMailWrite = async () => {
      try {
        const res = await caxios.post("/mail", mail, {
          headers: { "Content-Type": "application/json" }
        });

        const mailSeq = res.data; // MailController에서 seq 반환


        if (files && files.length > 0) {
          const form = new FormData();
          form.append('mailSeq', mailSeq); // mailSeq 포함
          Array.from(files).forEach(file => form.append('files', file));

          await caxios.post(`/file/mailSeq`, form, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          fileRef.current.value = "";
          setFiles([]);
        }
        Navigate("/mail");
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
      <div className={styles.container} style={{ width: "80%", margin: "auto", marginTop: "20px" }}>
        <div style={{ fontSize: "30px" }}>메일 작성</div>
        <hr></hr>
        <div className={styles.mainHeader}>

          <input type="text" className={styles.containerhalf} style={{ width: "50%", float: "left", fontSize:"20px" }} placeholder="주소록을 눌러 수신인을 추가해주세요"
            readOnly onChange={handleChange} name="recipientName" value={mail.recipientName} />
          <div style={{ width: "40%", marginLeft: "30px", float: "left" }}> <button onClick={handleAddContacts}> 주소록 </button></div>

          <input type="text" className={styles.containerhalf} placeholder="제목을 입력하세요"
            onChange={handleChange} name="title" value={mail.title} style={{ fontSize:"20px"}}/>
        </div>

        <div className={styles.mainBody}>

          <CKEditor
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

          />
        </div>
        <button onClick={handleFileClick} style={{ marginTop: "10px", float: "left" }}>파일 추가</button>
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

          {files.map((file, idx) => (
            <li key={idx} style={{ marginBottom: "3px" }}>
              {file.name}
            </li>))}

        </div>
        <button className={styles.backBtn} onClick={() => Navigate(-1)} style={{ marginTop: "10px" }}>뒤로가기</button>
        <button style={{ float: "right", marginRight: "40px", marginTop: "10px" }} onClick={handleMailWrite}>전송</button>
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
