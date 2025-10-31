import React, { useEffect, useState } from "react";
import { Input } from "antd";
import styles from "./BoardDetail.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import defaultProfile from "../../assets/images/defaultProfile.png";

const BoardDetail = () => {
  const { seq } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [board, setBoard] = useState(null);
  const [files, setFiles] = useState([]);
  const [writerProfile, setWriterProfile] = useState(null);

  // ✅ Zustand 로그인 ID
  const loginId = useAuthStore((state) => state.loginId);

  // ✅ 게시글 및 파일 불러오기
  useEffect(() => {
    caxios.get(`/board/detail/${seq}`).then((resp) => setBoard(resp.data));

    caxios
      .get(`/files/fileList?module_type=board&module_seq=${seq}`)
      .then((resp) => setFiles(resp.data))
      .catch((err) => console.error("파일 목록 불러오기 실패:", err));
  }, [seq]);

  // ✅ 프로필 불러오기
  useEffect(() => {
    if (board?.writer_id) {
      fetchWriterProfile(board.writer_id);
    }
  }, [board?.writer_id]);

  const fetchWriterProfile = async (writerId) => {
    try {
      const resp = await caxios.get(`/member/profile/${writerId}`);
      const profileName = resp.data?.profileImage_servName;
      setWriterProfile(
        profileName
          ? `https://storage.googleapis.com/yj_study/${profileName}`
          : null
      );
    } catch (err) {
      console.error("작성자 프로필 불러오기 실패:", err);
      setWriterProfile(null);
    }
  };

  // ✅ 파일 다운로드
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

  // ✅ 게시글 삭제
  const handleDelete = () => {
    if (window.confirm("해당 게시글을 삭제하시겠습니까?")) {
      caxios
        .delete(`/board/${seq}`)
        .then(() => {
          alert("삭제가 완료되었습니다!");
          if (board.category_id) navigate(`/board/${board.category_id}`);
          else navigate("/board");
        })
        .catch((err) => console.error("삭제 실패:", err));
    }
  };

  // ✅ 댓글 상태
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      const resp = await caxios.get(`/comment/${seq}`);
      setComments(resp.data);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (seq) fetchComments();
  }, [seq]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("댓글을 입력해주세요!");
      return;
    }
    try {
      await caxios.post("/comment", {
        parent_seq: seq,
        comments: newComment,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 등록 중 오류 발생");
    }
  };

  const handleDeleteComment = async (commentSeq) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        await caxios.delete(`/comment/${commentSeq}`);
        fetchComments();
      } catch (err) {
        console.error("댓글 삭제 실패:", err);
      }
    }
  };

  if (!board) return <div>로딩중...</div>;

  const isWriter =
    String(board.writer_id ?? "").trim().toLowerCase() ===
    String(loginId ?? "").trim().toLowerCase();

  return (
    <div className={styles.container}>
      {/* 옵션 버튼 */}
      <div className={styles.option}>
        {isWriter && (
          <>
            <button
              onClick={() =>
                navigate(`/board/edit/${seq}?from=${encodeURIComponent(location.pathname)}`)
              }
            >
              수정
            </button>
            <button onClick={handleDelete}>삭제</button>
          </>
        )}
      </div>

      {/* 헤더 */}
      <div className={styles.detailHeader}>
        <div className={styles.headerProfile}>
          <img
            src={writerProfile || defaultProfile}
            alt="작성자 프로필"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              marginLeft: "28px",
              marginTop: "10px",
              border: writerProfile ? "none" : "2px solid #ddd",
            }}
          />
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.title}>
            <Input
              value={board.title || ""}
              readOnly
              style={{
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
              }}
            />
          </div>
          <div className={styles.boardInfo}>
            <div>{board.writer_id}</div>
            <div>{board.category_name}</div>
            <div>조회수 {board.hit}</div>
          </div>
        </div>

        <div className={styles.date}>
          {board.createdAt
            ? new Date(board.createdAt).toLocaleDateString("ko-KR")
            : ""}
        </div>
      </div>

      {/* 본문 */}
      <div
        className={styles.boardContent}
        dangerouslySetInnerHTML={{ __html: board.content }}
      />

    {/* 첨부파일 영역 */}
<div className={styles.file}>첨부파일</div>

{files.length > 0 ? (
  <div className={styles.fileList}>
    <ul>
      {files.map((f) => (
        <li key={f.sysname || f.orgname}>
          <button
            onClick={() => handleDownload?.(f.sysname, f.orgname)}
            className={styles.fileBtn}
          >
            {f.orgname}
          </button>
        </li>
      ))}
    </ul>
  </div>
) : (
  <p className={styles.noFile}>첨부된 파일이 없습니다.</p>
)}

      {/* 댓글 */}
      <div className={styles.reply}>
        <div className={styles.writeReply}>
          <div className={styles.replyProfile}>
            <img
              src={writerProfile || defaultProfile}
              alt="작성자 프로필"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                marginLeft: "28px",
                marginTop: "10px",
                border: writerProfile ? "none" : "2px solid #ddd",
              }}
            />
          </div>

          <div className={styles.replyContent}>
            <Input.TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
              style={{ width: "100%", resize: "none" }}
            />
          </div>

          <button className={styles.replyBtn} onClick={handleAddComment}>
            등록
          </button>
        </div>

        <div className={styles.commentList}>
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.seq} className={styles.commentItem}>
                <div className={styles.commentProfile}>
                  <img
                    src={writerProfile || defaultProfile}
                    alt="댓글 프로필"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginLeft: "28px",
                      marginTop: "10px",
                      border: writerProfile ? "none" : "2px solid #ddd",
                    }}
                  />
                </div>
                <div className={styles.commentMain}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentInfo}>
                      <span className={styles.commentWriter}>{c.writer_id}</span>
                      <span className={styles.commentDate}>
                        {new Date(c.writeDate).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <button
                      className={styles.commentDelete}
                      onClick={() => handleDeleteComment(c.seq)}
                    >
                      삭제
                    </button>
                  </div>
                  <div className={styles.commentBody}>{c.comments}</div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noComment}>등록된 댓글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
