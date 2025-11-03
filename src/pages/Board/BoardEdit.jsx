import React, { useState, useEffect } from "react";
import { Select, Input, Checkbox } from "antd";
import styles from "./BoardWrite.module.css";
import { caxios } from "../../config/config.js";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TiptapEditor from "../Common/TipTapEditor.jsx";

const { Option } = Select;

const BoardEdit = () => {
  const navigate = useNavigate();
  const { seq } = useParams();
  const [searchParams] = useSearchParams();
  const fromPath = searchParams.get("from") || "/board/1/announcement";

  const [board, setBoard] = useState({
    title: "",
    content: "",
    noticeYn: "N",
    category_id: "",
  });

  const [files, setFiles] = useState([]);
  const [originFiles, setOriginFiles] = useState([]);

  // ✅ 기존 게시글 / 파일 불러오기
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const resp = await caxios.get(`/board/detail/${seq}`);
        setBoard({
          title: resp.data.title,
          content: resp.data.content,
          noticeYn: resp.data.noticeYn?.toUpperCase() === "Y" ? "Y" : "N",
          category_id: String(resp.data.category_id),
        });

        const fileResp = await caxios.get(
          `/files/fileList?module_type=board&module_seq=${seq}`
        );
        setOriginFiles(fileResp.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };
    fetchBoard();
  }, [seq]);

  // ✅ 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({ ...prev, [name]: value }));
  };

  const handleNoticeChange = (e) => {
    setBoard((prev) => ({
      ...prev,
      noticeYn: e.target.checked ? "Y" : "N",
    }));
  };

  const handleCategoryChange = (val) => {
    setBoard((prev) => ({ ...prev, category_id: val }));
  };

  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // ✅ 수정 저장
  const handleUpdate = async () => {
    try {
      // 1️⃣ 본문 수정
      await caxios.put(`/board/${seq}`, board);
      console.log("게시글 수정 완료");

      // 2️⃣ 새 파일 업로드
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("module_type", "board");
        formData.append("module_seq", seq);
        files.forEach((file) => formData.append("files", file));

        await caxios.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("파일 업로드 완료");
      }

      alert("게시글이 수정되었습니다!");
      navigate(fromPath);
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.btns}>
        <button onClick={handleUpdate}>수정 완료</button>
        <button onClick={() => navigate(fromPath)}>취소</button>
      </div>

      <div className={styles.boardGroup}>
        <label>게시판</label>
        <Select
          value={board.category_id}
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

        {/* ✅ 기존 파일 목록 */}
        {originFiles.length > 0 && (
          <ul className={styles.filePreview}>
            {originFiles.map((file, i) => (
              <li key={i}>{file.orgname}</li>
            ))}
          </ul>
        )}

        {/* ✅ 새로 선택한 파일 */}
        {files.length > 0 && (
          <ul className={styles.filePreview}>
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}

        <div className={styles.fileBtnBox}>
          <label htmlFor="file" className={styles.customFileLabel}>
            <span className={styles.labelText}>파일 추가</span>
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

      {/* ✅ TipTap 에디터로 변경 */}
      <div style={{ marginTop: 20 }}>
        <TiptapEditor
          value={board.content}
          onChange={(html) => setBoard((prev) => ({ ...prev, content: html }))}
          moduleType="board"
          moduleSeq={seq}
        />
      </div>
    </div>
  );
};

export default BoardEdit;
