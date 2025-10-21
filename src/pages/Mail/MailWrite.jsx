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



  // // 전송 버튼 클릭 시
  // const handleMailWrite = () => {
  //   caxios.post("/mail", mail, {
  //     headers: { "Content-Type": "application/json" }
  //   }).then((res) => {
  //     // setMail(res.data);
  //     Navigate("/mail");
  //   });
  // };

  const handleMailWrite = async () => {

    const res = await caxios.post("/mail", mail, {
      headers: { "Content-Type": "application/json" }
    });
    const mailSeq = res.data; // MailController에서 seq 반환


    if (files && files.length > 0) {
      const form = new FormData();
      form.append('mailSeq', mailSeq); // mailSeq 포함
      Array.from(files).forEach(file => form.append('files', file));

      await caxios.post(`/files/mailSeq`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      fileRef.current.value = "";
      setFiles([]);
    }


    Navigate("/mail");

  };


  // MODAL

  const [Modalcontacts, setModalContacts] = useState(false);

  // 수신자(주소록에서) 추가
  const handleAddContacts = () => {
    setModalContacts(true);
  };


  return (
    <div className={styles.container}>


      <div className={styles.mainHeader}>

        <input type="text" className={styles.containerhalf} style={{ width: "93%", float: "left" }} placeholder="수신자를 입력하세요"
          onChange={handleChange} name="recipientId" value={mail.recipientId} />
        <div style={{ width: "5%", float: "left" }}> <button onClick={handleAddContacts}> + </button></div>

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
        {/* <button style={{ float: "left" }} onClick={handleMailUpload}>파일 업로드</button> */}
        <button className={styles.backBtn} onClick={() => Navigate(-1)}>뒤로가기</button>
        <button style={{ float: "right" }} onClick={handleMailWrite}>전송</button>
      </div>

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
        <MailAddContacts onSelect={names => setMail(prev => ({ ...prev, recipientId: names }))}  onCancel={() => setModalContacts(false)} />
      </Modal>
    </div>


  );
};

export default MailWrite;
