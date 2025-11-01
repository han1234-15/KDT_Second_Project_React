import React, { useState, useEffect } from "react";
import { Select, Input, Checkbox } from "antd";
import styles from "./BoardWrite.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import TiptapEditor from "../Common/TipTapEditor.jsx";

const { Option } = Select;

const BoardWrite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") || "";
  const fromPath = searchParams.get("from") || "/board/1/announcement"; // ✅ 돌아갈 경로 기억

  const [board, setBoard] = useState({
    title: "",
    content: "",
    noticeYn: "N",
    category_id: initialCategory,
  });

  const [category_id, setCategory_id] = useState(initialCategory);
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setBoard((prev) => ({ ...prev, content: data }));
  };

  const handleNoticeChange = (e) => {
    setBoard((prev) => ({
      ...prev,
      noticeYn: e.target.checked ? "Y" : "N",
    }));
  };

  const handleCategoryChange = (val) => {
    setCategory_id(val);
    setBoard((prev) => ({ ...prev, category_id: val }));
  };

  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // ✅ 글 작성
  const handleSubmit = async () => {
    try {
      const boardResp = await caxios.post("/board", board);
      const boardSeq = boardResp.data;
      console.log("게시글 등록 완료, seq:", boardSeq);

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("module_type", "board");
        formData.append("module_seq", boardSeq);
        files.forEach((file) => formData.append("files", file));

        await caxios.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("파일 업로드 완료");
      }

      alert("게시글이 등록되었습니다!");
      // ✅ 작성 후 원래 페이지로 돌아감
      navigate(fromPath);
    } catch (err) {
      console.error("등록 실패:", err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.btns}>
        <button onClick={handleSubmit}>확인</button>
        <button onClick={() => navigate(fromPath)}>취소</button>
      </div>

      <div className={styles.boardGroup}>
        <label>게시판</label>
        <Select
          value={category_id || board.category_id} // ✅ 자동 선택
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
          className={styles.noticeCheck}
          checked={board.noticeYn === "Y"}
          onChange={handleNoticeChange}
        >
          공지 등록
        </Checkbox>
      </div>


      <div className={styles.fileBox}>
        <div className={styles.file}>
          <label>파일 첨부</label>
        </div>
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
        <TiptapEditor
          value={board.content}
          onChange={(html) => setBoard((prev) => ({ ...prev, content: html }))}
          moduleType="board"
          moduleSeq={board.seq || 0}  // 새 글이면 0, 등록 후 seq 갱신됨
        />
      </div>
    </div>
  );
};

export default BoardWrite;
