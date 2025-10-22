import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { caxios } from "../../config/config";
import "./styles/ApprovalPage.css";

function EApproval() {
  const navigate = useNavigate();
  const { status = "show" } = useParams();
  const [docs, setDocs] = useState([]);

  // 상태 코드 → 한글 이름 매핑
  const statusMap = {
    show: "전체",
    pending: "승인 대기",
    in_progress: "진행 중",
    rejected: "반려",
    scheduled: "확인",
    approved: "예정",
    TEMP: "임시 저장",
  };

  // 데이터 로드
  useEffect(() => {
    const url = `/Eapproval/${status === "show" ? "A" : status}`;

    caxios
      .get(url)
      .then((res) => {
        let data = res.data;

        if (status === "A" || status === "show") {
          data = data.filter((doc) => doc.status !== "TEMP");
        }
        if (status === "TEMP") {
          data = data.filter((doc) => doc.status === "TEMP");
        }
        setDocs(data);
      })
      .catch((err) => console.error(err));
  }, [status]);

  return (
    <div className="approval-container">
      {/* ✅ 테이블만 남긴 화면 */}
      <table className="approval-table">
        <thead>
          <tr>
            <th>문서번호</th>
            <th>제목</th>
            <th>기안자</th>
            <th>기안일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {docs.length > 0 ? (
            docs.map((doc) => (
              <tr key={doc.seq}>
                <td>{doc.seq}</td>
                <td
                  className="title-cell"
                  style={{ cursor: "pointer", color: "#0077cc", textDecoration: "underline" }}
                  onClick={() => {
                    if (doc.status === "TEMP") {
                      navigate(`/Eapproval/edit/${doc.seq}`);
                    } else {
                      navigate(`/Eapproval/detail/${doc.seq}`);
                    }
                  }}
                >
                  {doc.title}
                </td>
                <td>{doc.writer}</td>
                <td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td>
                <td>{statusMap[doc.status]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-msg">
                표시할 문서가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EApproval;
