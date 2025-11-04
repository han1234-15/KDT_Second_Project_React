import React, { useState, useEffect } from "react";
import { Select, Input, Checkbox } from "antd";
import styles from "./BoardWrite.module.css";
import { caxios } from "../../config/config.js";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TiptapEditor from "../Common/TipTapEditor.jsx";
import useAuthStore from "../../store/authStore.js";

const { Option } = Select;

const BoardWrite = () => {
  const token = useAuthStore((state) => state.token); //  로그인 상태의 토큰을 가져옴
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
  const [myInfo, setMyInfo] = useState(null); // ✅ 사용자 정보
  const [isAdmin, setIsAdmin] = useState(false); // ✅ 관리자 여부
  const [loading, setLoading] = useState(true);

   useEffect(() => {
  
    // 서버에 권한 확인 요청
    const checkAdmin = async () => {
      try {
        const res = await caxios.get("/auth/check");
        // 서버에서 { isAdmin: true/false } 형태로 응답한다고 가정

        console.log("어드민:" + res.data);
        setIsAdmin(res.data);
      } catch (err) {
        console.error("권한 확인 실패", err);
        setIsAdmin(false);
      }
    };

    if (token) checkAdmin();
  }, [token]);


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

  // 알림
    const sendTestNotice = async (receiver_id, type, message) => {
    await caxios.post("/notification/send", {
      receiver_id: receiver_id, // 실제 로그인 ID로 전달받을 사람.
      type: type,
      message: message,
      created_at: new Date().toISOString(),
    });
  };

  // 글 작성
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

       // 공지글일 때만 알림 발송
    if (board.noticeYn === "Y") {
      await sendTestNotice(
        "All",                
        "공지",           
        `${board.title} 공지사항이 등록되었습니다.`  
      );
      console.log("공지 등록 알림 발송 완료 ");
    }

      alert("게시글이 등록되었습니다!");
      navigate(fromPath);
    } catch (err) {
      console.error("등록 실패:", err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.btns}>
        <button onClick={handleSubmit}>등록</button>
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
          <Option value="1">사내게시판</Option>
          <Option value="2">자유게시판</Option>
          <Option value="3">익명게시판</Option>
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

        {/* 관리자만 공지 체크 가능 */}
        {isAdmin  && (
          <Checkbox
            className={styles.noticeCheck}
            checked={board.noticeYn === "Y"}
            onChange={handleNoticeChange}
          >
            공지 등록
          </Checkbox>
        )}
      </div>


      <div className={styles.fileBox}>
        <div className={styles.file}>
          <label>파일 첨부</label>
        </div>
        <div className={styles.fileList}>
        {files.length > 0 && (
          <ul className={styles.filePreview}>
            {files.map((file, i) => (
              <li key={i}><span>{file.name}</span>
              <button
                className={styles.deleteBtn}
                onClick={() =>
                  setFiles((prev) => prev.filter((_, index) => index !== i))
                }
              >
                x
              </button></li>
            ))}
          </ul>
        )}
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
