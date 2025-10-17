import styles from "./Mail.module.css";
import axios from "axios";
import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { color } from "framer-motion";

const MailWrite = () => {


  const Navigate = useNavigate();
  const fileRef = useRef();
  const [files, setFiles] = useState([]);

  const [mail, setMail] = useState({
    user_id: "김이사(임시)",
    senderId: "김준표(임시)",
    recipientId: "",
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

  // 전송 버튼 클릭 시
  const handleMailWrite = () => {
    axios.post("http://10.5.5.12/mail", mail, {
      headers: { "Content-Type": "application/json" }
    }).then((res) => {
      // setMail(res.data);
      Navigate("/mail");
    });
  };


  const handleMailUpload = () => {
    const form = new FormData();

    // files가 존재할 경우에만 추가
    if (files && files.length > 0) {
      Array.from(files).forEach(file => form.append('files', file));
    }

    axios.post("http://10.5.5.12/files", form, {
      headers: { "Content-Type": "multipart/form-data" }
    })
      .then(res => {
        fileRef.current.value = "";
        setFiles([]);
      })
      .catch(err => {
        console.error(err);
      });
  };




  return (
    <div className={styles.container}>


      <div className={styles.mainHeader}>

        <input type="text" className={styles.containerhalf} placeholder="수신자를 입력하세요"
          onChange={handleChange} name="recipientId" value={mail.recipientId} />

        <input type="text" className={styles.containerhalf} placeholder="제목을 입력하세요"
          onChange={handleChange} name="title" value={mail.title} />
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
      <div style={{ marginTop: "10px" }}>
        {/* <button style={{ float: "left" }}>파일 업로드</button> */}
        <input
          type="file"
          multiple
          ref={fileRef}
          onChange={(e) => setFiles(e.target.files)}
          style={{ marginBottom: "10px" }}
        />
        <button style={{ float: "left" }} onClick={handleMailUpload}>파일 업로드</button>
        <button className={styles.backBtn} onClick={() => Navigate(-1)}>뒤로가기</button>
        <button style={{ float: "right" }} onClick={handleMailWrite}>전송</button>
      </div>
    </div>
  );
};

export default MailWrite;
