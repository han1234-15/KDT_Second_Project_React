import React, { useState } from "react";
import { Input } from "antd";
import styles from "./BoardDetail.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { caxios } from "../../config/config.js";
import { RedditOutlined } from "@ant-design/icons";


const BoardDetail = () => {
  return (
    <div className={styles.container}>
      <div className={styles.option}>
        <button>답글</button>
        <button>수정</button>
        <button>삭제</button>
        <button style={{width:"90px"}}>공지해제</button>
      </div>
      <div className={styles.detailHeader}>
        <div className={styles.headerProfile}>
          <RedditOutlined style={{ fontSize: "50px", marginLeft: "28px", marginTop: "10px" }} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.title}>
            <div>태그</div> {/* 공지가 있을 때만 태그 보이게 */}
            <div>제목</div>
          </div>
          <div className={styles.boardInfo}>
            <div>작성자</div>
            <div>게시판분류</div>
            <div>조회수</div>
          </div>
        </div>
        <div className={styles.date}>작성날짜</div>
      </div>
      <div className={styles.boardContent}>


      </div>
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

    </div>
  );
};

export default BoardDetail;
