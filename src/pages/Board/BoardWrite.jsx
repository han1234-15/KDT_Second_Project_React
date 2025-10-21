import React, { useState } from "react";
import { Select, Input, Checkbox } from "antd";
import styles from "./BoardWrite.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";

const { Option } = Select;

const BoardWrite = () => {
  //게시글 상태
  const [board, setBoard] = useState({
    title: "",
    content: "",
    noticeYn: "N",
    category: "a1",
  });

  //게시판 선택
  const [category, setCategory] = useState("a1");
  const handleCategoryChange = (val) => {
    console.log("선택된 게시판:", val);
    setCategory(val);
    setBoard((prev) => ({ ...prev, category: val }));
  };

  //제목 입력
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({ ...prev, [name]: value }));
  };

  //체크박스
  const handleNoticeChange = (e) => {
    setBoard((prev) => ({
      ...prev,
      noticeYn: e.target.checked ? "Y" : "N",
    }));
  };

  //에디터
  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setBoard((prev) => ({ ...prev, content: data }));
  };

  //파일
  const [files, setFiles] = useState([]);
  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  //submit 버튼
const handleSubmit = async () => {
  try {
        // 로그인 시 저장해둔 사용자 ID 불러오기 (sessionStorage 기준)
    const writerId = sessionStorage.getItem("userId") || "testUser"; 
    // 로그인 시스템이 아직 없으면 임시로 "testUser" 지정

    // board 데이터에 writerId 추가
    const boardData = {
      ...board,
      writerId: writerId,
    };

    console.log("게시글 데이터:", boardData);
    const res = await caxios.post("/board", board, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("등록 성공:", res.data);
    alert("게시글이 성공적으로 등록되었습니다!");
  } catch (error) {
    console.error("등록 실패:", error);
    alert("게시글 등록 중 오류가 발생했습니다.");
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
          value={category}
          onChange={handleCategoryChange}
          style={{ width: 240 }}
          placeholder="게시판을 선택하세요"
        >
          <Option value="a1">자유게시판</Option>
          <Option value="b1">익명게시판</Option>
          <Option value="c1">자료실</Option>
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

      <div className={styles.fileBox}>
        <div className={styles.file}>
          <label>파일 첨부</label>
        </div>
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
