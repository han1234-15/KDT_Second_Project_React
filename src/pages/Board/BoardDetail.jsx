import React, { useEffect, useState } from "react";
import { Input } from "antd";
import styles from "./BoardDetail.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";
import { RedditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";


const BoardDetail = () => {

  // URL 파라미터에서 seq 꺼내오기
  const { seq } = useParams();

  const navigate = useNavigate();

  // board useState
  const [board, setBoard] = useState({
    category_id: "", category_name: "", title: "", content: "",
    writer_id: "", noticeYn: "", hit: "", createdAt: "",
  });
  // board backup
  const [originalBoard, setOriginalBoard] = useState(null);

  // 속성 
  const [fixMode, setFixMode] = useState(false);

  // 서버에서 상세 데이터 불러오기
  useEffect(() => {
    caxios.get(`/board/detail/${seq}`).then(resp => {
      console.log(resp)
      setBoard(resp.data);
      setOriginalBoard(resp.data);
    });
  }, [seq]);

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
      {!fixMode && (
        <div className={styles.reply}>
          <div className={styles.writeReply}>
            <div className={styles.replyProfile}>
              <RedditOutlined style={{ fontSize: "50px", marginLeft: "50px", marginTop: "25px" }} />
            </div>
            {/* <div className={styles.write}></div>
            <div className={styles.date}></div> */}
            <div className={styles.replyContent}>
              <Input
                name="title"
                style={{ width: "1200px" }}
                placeholder="댓글을 입력하세요"

              />
            </div>
            <button className={styles.replyBtn}>등록</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BoardDetail;
