import React, { useEffect, useState } from "react";
import { Input } from "antd";
import styles from "./BoardDetail.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";
import { RedditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";


const BoardDetail = () => {

  // URL 게시글 번호 
  const { seq } = useParams();
  const navigate = useNavigate();

  // board useState
  const [board, setBoard] = useState({
    category_id: "", category_name: "", title: "", content: "",
    writer_id: "", noticeYn: "", hit: "", createdAt: "",
  });

  // board backup
  const [originalBoard, setOriginalBoard] = useState(null);

  // file
  const [files, setFiles] = useState([]);

  // 속성 
  const [fixMode, setFixMode] = useState(false);

  // 서버에서 상세 데이터 불러오기
  useEffect(() => {

    // 게시글 내용
    caxios.get(`/board/detail/${seq}`).then((resp) => setBoard(resp.data));

    // 첨부파일 목록 (전역 파일 API)
    caxios
      .get(`/files/fileList?module_type=board&module_seq=${seq}`)
      .then((resp) => setFiles(resp.data))
      .catch((err) => console.error("파일 목록 불러오기 실패:", err));
  }, [seq]);

  // 파일 다운로드
  const handleDownload = async (sysname, orgname) => {
    try {
      const response = await caxios.get(`/files/download?sysname=
        ${encodeURIComponent(sysname)}`, {responseType: "blob",
});

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", orgname); // 원본 파일명 지정
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("파일 다운로드 실패:", err);
      alert("파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  // 수정 버튼
  const handleEdit = () => {
    setFixMode(true);
  }

  // 제목 변경
  const handleonChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({ ...prev, [name]: value }))
  }

  // 컨텐츠 변경
  const handleEditorChange = (e, editor) => {
    const data = editor.getData();
    setBoard((prev) => ({ ...prev, content: data }));
  }

  // 공지 여부 변경
  const handleNoticeChange = (e) => {
    setBoard((prev) => ({
      ...prev, noticeYn: e.target.checked ? "Y" : "N",
    }));
  };

  // 수정 취소
  const handleCancel = () => {
    setFixMode(false);
    setBoard(originalBoard);
  };

  // 수정 완료 
  const handleSave = async () => {
    try {
      await caxios.put(`/board/${seq}`, board);
      alert("수정이 완료되었습니다!");
      setFixMode(false);
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류 발생");
    }
  };

  // 삭제
  const handleDelete = () => {
    if (window.confirm("해당 게시글을 삭제하시겠습니까?")) {
      caxios.delete(`/board/${seq}`)
        .then(() => {
          console.log("삭제 완료");
          alert("삭제가 완료되었습니다!");

          // 원래 게시판으로 돌아가기
          if (board.category_id) {
            navigate(`/board/${board.category_id}`);
          } else {
            navigate("/board"); // fallback
          }
        })
        .catch(err => {
          console.error("삭제 실패:", err);
        });
    }
  }

  // 댓글 상태 관리
  const [comments, setComments] = useState([]);      // 댓글 목록
  const [newComment, setNewComment] = useState("");  // 새 댓글 입력값

  // 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const resp = await caxios.get(`/comment/${seq}`);
      setComments(resp.data);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  // 컴포넌트 로드시 댓글 목록 로드
  useEffect(() => {
    if (seq) fetchComments();
  }, [seq]);

  // 댓글 작성
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
      fetchComments(); // 새로고침
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 등록 중 오류 발생");
    }
  };

  // 댓글 삭제
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

  return (
    <div className={styles.container}>
      <div className={styles.option}>
        {!fixMode ? (
          <>
            <button onClick={handleEdit}>수정</button>
            <button onClick={handleDelete}>삭제</button>
          </>
        ) : (
          <>
            <button onClick={handleSave}>저장</button>
            <button onClick={handleCancel}>취소</button>
          </>
        )}
      </div>
      <div className={styles.detailHeader}>
        <div className={styles.headerProfile}>
          <RedditOutlined style={{ fontSize: "50px", marginLeft: "28px", marginTop: "10px" }} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.title}>
            {/* 제목 */}
            <Input
              name="title"
              onChange={handleonChange}
              value={board.title ? board.title : ""}
              readOnly={!fixMode}
              className={fixMode ? styles.inputEdit : styles.inputReadonly}
            />
          </div>

          {/* 작성자 , 게시판 카테고리 , 조회수 */}
          <div className={styles.boardInfo}>
            <div>{board.writer_id}</div>
            <div>{board.category_name}</div>
            <div>{board.hit}</div>
          </div>
        </div>
        <div className={styles.date}>{board.createdAt ? new Date(board.createdAt).toLocaleDateString("ko-KR") : ""}</div>
      </div>
      <div className={styles.boardContent}>
        {fixMode ? (
          <CKEditor
            editor={ClassicEditor}
            data={board.content}
            onChange={handleEditorChange}
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: board.content }} />
        )}
      </div>
      <div className={styles.file}>첨부파일</div>
      {/* 첨부파일 목록 */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          <ul>
            {files.map((f) => (
              <li key={f.sysname}>
                <button onClick={() => handleDownload(f.sysname, f.orgname)}
                  className={styles.fileBtn}> {f.orgname}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* 댓글 영역 */}
      {!fixMode && (
        <div className={styles.reply}>
          {/* 댓글 입력 */}
          <div className={styles.writeReply}>
            <div className={styles.replyProfile}>
              <RedditOutlined style={{ fontSize: "45px", marginLeft: "20px", marginTop: "15px" }} />
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

          {/* 댓글 목록 */}
          <div className={styles.commentList}>
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.seq} className={styles.commentItem}>
                  <div className={styles.commentProfile}>
                    <RedditOutlined style={{ fontSize: "40px" }} />
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
      )}
    </div>
  );
};

export default BoardDetail;
