import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/ApprovalDetail.css";

function EApprovalDetail() {
  const { seq } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
  axios
    .get(`http://10.5.5.11/Eapproval/detail/${seq}`)
    .then((res) => {
      console.log("📡 detail data:", res.data);
      setDoc(res.data);
    })
    .catch((err) => console.error("❌ detail error:", err));
}, [seq]);

  if (!doc) return <div>📄 문서를 불러오는 중...</div>;

  return (
    <div className="approval-detail-container">
      <h2>문서 상세보기</h2>
      <table className="detail-table">
        <tbody>
          <tr>
            <th>문서번호</th>
            <td>{doc.seq}</td>
          </tr>
          <tr>
            <th>제목</th>
            <td>{doc.title}</td>
          </tr>
          <tr>
            <th>작성자</th>
            <td>{doc.writer}</td>
          </tr>
          <tr>
            <th>작성일</th>
            <td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td>
          </tr>
          <tr>
            <th>상태</th>
            <td>{doc.status}</td>
          </tr>
          <tr>
            <th>내용</th>
            <td className="content">{doc.comments}</td>
          </tr>
        </tbody>
      </table>

      <div className="button-area">
        <button onClick={() => navigate(-1)}>← 목록으로</button>
      </div>
    </div>
  );
}

export default EApprovalDetail;
