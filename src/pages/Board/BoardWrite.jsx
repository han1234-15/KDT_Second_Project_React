import React, { useState } from "react";
import { Select, Input, Checkbox } from "antd";
import styles from "./BoardWrite.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const BoardWrite = () => {

  const navigate = useNavigate();

  // 게시글 상태
  const [board, setBoard] = useState({
    title: "",
    content: "",
    noticeYn: "",
    category_id: "",
  });

  // 제목 입력
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({ ...prev, [name]: value }));
  }
  // 컨텐츠 (에디터)
  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setBoard((prev) => ({ ...prev, content: data }));
  };

  // 체크박스
  const handleNoticeChange = (e) => {
    setBoard((prev) => ({
      ...prev,
      noticeYn: e.target.checked ? "Y" : "N",
    }));
  };

  // 게시판 선택
  const [category_id, setCategory_id] = useState("");

  const handleCategoryChange = (val) => {

    console.log("선택된 게시판:", val);

    setCategory_id(val);
    setBoard((prev) => ({ ...prev, category_id: val }));
  };

  // 파일 상태
  const [files, setFiles] = useState([]);
  // 파일 선택
  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // 글 작성 submit 버튼
  const handleSubmit = async () => {
    try {
      // 게시글 먼저 등록 (board 테이블)
      const boardResp = await caxios.post("/board", board);
      const boardSeq = boardResp.data; // controller가 seq 리턴 중

      console.log("게시글 등록 완료, seq:", boardSeq);

      // 파일이 있을 경우 전역 파일 업로드
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("module_type", "board");
        formData.append("module_seq", boardSeq); // 게시글 PK

        files.forEach((file) => {
          formData.append("files", file);
        });

        await caxios.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("파일 업로드 완료");
      }

      alert("게시글이 등록되었습니다!");

      navigate(`/board/${board.category_id}`);
    } catch (err) {
      console.error("등록 실패:", err);

      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.btns}>
        <button onClick={handleSubmit}>확인</button>
        <button>임시저장</button>
      </div>

      <div className={styles.boardGroup}>
        <label>게시판</label>
        <Select
          value={category_id}
          onChange={handleCategoryChange}
          style={{ width: 240 }}
          placeholder="게시판을 선택하세요"
        >
          <Option value="1">공지사항</Option>
          <Option value="2">자유게시판</Option>
          <Option value="3">익명게시판</Option>
          <Option value="4">자료실</Option>
        </Select>
      </div>

      <div className={styles.titleInput}>
        <label>제목</label>
        <Input
          name="title"
          onChange={handleChange}
          value={board.title}
          style={{ width: "500px" }}
          placeholder="제목을 입력하세요"
        />
        <Checkbox
          checked={board.noticeYn === "Y"}
          onChange={handleNoticeChange}
        >
          공지로 등록
        </Checkbox>
      </div>

      {/* 파일 업로드 */}
      <div className={styles.fileBox}>
        <div className={styles.file}>
          <label>파일 첨부</label>
        </div>
        {/* 선택된 파일 목록 표시 */}
        {files.length > 0 && (
          <ul className={styles.filePreview}>
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}
        <div className={styles.fileBtnBox}>
          <label htmlFor="file" className={styles.customFileLabel}>
            <span className={styles.labelText}>파일 선택</span>
          </label>
          <input
            type="file"
            id="file"
            multiple
            onChange={handleFileSelect}
            className={styles.fileBtn}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <CKEditor
          editor={ClassicEditor}
          data={board.content}
          onChange={handleEditorChange}
          config={{
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "insertTable",
              "blockQuote",
              "undo",
              "redo",
            ],
          }}
        />
      </div>
    </div>
  );
};

export default BoardWrite;
