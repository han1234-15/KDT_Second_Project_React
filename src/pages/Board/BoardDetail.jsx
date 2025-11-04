import React, { useEffect, useState } from "react";
import { Input, Pagination } from "antd";
import styles from "./BoardDetail.module.css";
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
  const [comments, setComments] = useState([]);
  const [commentProfiles, setCommentProfiles] = useState({});
  const [writerProfile, setWriterProfile] = useState(null);
  const [loginProfile, setLoginProfile] = useState(null); // ✅ 로그인 사용자 프로필 추가
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loginId = useAuthStore((state) => state.loginId);
  const logout = useAuthStore((state) => state.logout);

  // ✅ 게시글 + 파일 + 로그인 프로필 + 작성자 프로필 불러오기
  useEffect(() => {
    const loadBoard = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          // ✅ 로그인 사용자 프로필 가져오기
          const meResp = await caxios.get("/member/userInfo").catch(() => {
            logout();
            sessionStorage.removeItem("token");
          });

          if (meResp?.data?.profileImage_servName) {
            setLoginProfile(
              `https://storage.googleapis.com/yj_study/${meResp.data.profileImage_servName}`
            );
          }
        }

        // ✅ 게시글 불러오기
        const boardResp = await caxios.get(`/board/detail/${seq}`);
        setBoard(boardResp.data);

        // ✅ 첨부파일 불러오기
        const fileResp = await caxios.get(
          `/files/fileList?module_type=board&module_seq=${seq}`
        );
        setFiles(fileResp.data);

        // ✅ 게시글 작성자 프로필 (익명 게시판 제외)
        if (boardResp.data?.writer_id && boardResp.data.category_id !== 3) {
          const writerResp = await caxios.get(`/member/info/${boardResp.data.writer_id}`);
          const profileName = writerResp.data?.profileImage_servName;
          setWriterProfile(
            profileName
              ? `https://storage.googleapis.com/yj_study/${profileName}`
              : null
          );
        }
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBoard();
  }, [seq]);

  // ✅ 댓글 불러오기
  const fetchComments = async (pageNum = 1) => {
    try {
      const resp = await caxios.get(`/comment/${seq}`, {
        params: { page: pageNum, size: pageSize },
      });
      const { list, totalCount } = resp.data;
      const commentList = list || resp.data;
      setComments(commentList);
      if (totalCount) setTotal(totalCount);
      setPage(pageNum);

      // ✅ 댓글 작성자 프로필 (익명 제외)
      if (board?.category_id !== 3) {
        const profileMap = {};
        await Promise.all(
          commentList.map(async (c) => {
            if (c.writer_id) {
              try {
                const res = await caxios.get(`/member/info/${c.writer_id}`);
                const profileName = res.data?.profileImage_servName;
                profileMap[c.writer_id] = profileName
                  ? `https://storage.googleapis.com/yj_study/${profileName}`
                  : null;
              } catch {
                profileMap[c.writer_id] = null;
              }
            }
          })
        );
        setCommentProfiles(profileMap);
      }
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (seq) fetchComments();
  }, [seq, board?.category_id]);

  // ✅ 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("댓글을 입력해주세요!");
    try {
      await caxios.post("/comment", { parent_seq: seq, comments: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 등록 중 오류 발생");
    }
  };

  // ✅ 댓글 삭제
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
    } catch {
      alert("파일 다운로드 실패");
    }
  };

  if (loading || !board) return <div>로딩중...</div>;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  return (
    <div className={styles.container}>
      {/* 옵션 버튼 */}
      <div className={styles.option}>
        {/* 작성자 본인일 때만 수정/삭제 버튼 노출 */}
        {loginId === board.writer_id && (
          <>
            <button onClick={() => navigate(`/board/edit/${board.seq}?from=${location.state?.from || "/board/1/announcement"}`)}>
              수정
            </button>
            <button
              onClick={async () => {
                if (window.confirm("게시글을 삭제하시겠습니까?")) {
                  try {
                    await caxios.delete(`/board/${board.seq}`);
                    alert("게시글이 삭제되었습니다.");
                    navigate(location.state?.from || "/board/1/announcement");
                  } catch (err) {
                    console.error("게시글 삭제 실패:", err);
                    alert("삭제 중 오류가 발생했습니다.");
                  }
                }
              }}
            >
              삭제
            </button>
          </>
        )}
        <button onClick={() => navigate(location.state?.from || "/board/1/announcement")}>
          목록
        </button>
      </div>

      {/* 헤더 */}
      <div className={styles.detailHeader}>
        <div className={styles.headerProfile}>
          <img
            src={
              board.category_id === 3
                ? defaultProfile
                : writerProfile || defaultProfile
            }
            alt="작성자 프로필"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              marginLeft: "28px",
              marginTop: "10px",
              border: "2px solid #cacacaff",
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
                fontSize: "16px",
              }}
            />
          </div>
          <div className={styles.boardInfo}>
            <div>
              {board.category_id === 3
                ? "익명"
                : board.writer_name || board.writer_id}
            </div>
            <div>{board.category_name}</div>
            <div>조회수 {board.hit}</div>
          </div>
        </div>

        <div className={styles.date}>
          {formatDate(board.updatedAt || board.createdAt)}
        </div>
      </div>

      {/* 본문 */}
      <div
        className={styles.boardContent}
        dangerouslySetInnerHTML={{ __html: board.content }}
      />

      {/* 첨부파일 */}
      <div className={styles.file}>첨부파일</div>
      {files.length > 0 ? (
        <div className={styles.fileList}>
          <ul>
            {files.map((f) => (
              <li key={f.sysname}>
                <button
                  onClick={() => handleDownload(f.sysname, f.orgname)}
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
      <div
        className={`${styles.reply} ${board.category_id === 3 ? styles.anonymousReply : ""
          }`}
      >
        <div className={styles.writeReply}>
          <div className={styles.replyProfile}>
            <img
              src={
                board.category_id === 3
                  ? defaultProfile
                  : loginProfile || defaultProfile
              }
              alt="로그인 사용자 프로필"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                marginLeft: "24px",
                marginTop: "10px",
                border: "2px solid #cacacaff",
              }}
            />
          </div>

          <div className={styles.replyContent}>
            <Input.TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요. ( 최대 1000자 )"
              rows={3}
              maxLength={1000}  
              showCount         
              style={{ width: "97%", resize: "none", marginLeft: "13px" }}
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
                  <img
                    src={
                      board.category_id === 3
                        ? defaultProfile
                        : commentProfiles[c.writer_id] || defaultProfile
                    }
                    alt="댓글 프로필"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #d9d9d9",
                      marginRight: "10px",
                    }}
                  />
                </div>
                <div className={styles.commentMain}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentInfo}>
                      <span className={styles.commentWriter}>
                        {board.category_id === 3
                          ? "익명"
                          : c.writer_name || c.writer_id}
                      </span>
                      <span className={styles.commentDate}>
                        {new Date(c.writeDate).toLocaleString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <div className={styles.commentBody}>{c.comments}</div>
                </div>
                {loginId === c.writer_id && (
                  <button
                    className={
                      board.category_id === 3
                        ? styles.commentDeleteAnonymous
                        : styles.commentDelete
                    }
                    onClick={() => handleDeleteComment(c.seq)}
                  >
                    X
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noComment}>등록된 댓글이 없습니다.</p>
          )}
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={fetchComments}
            style={{ marginTop: "20px", textAlign: "center" }}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
