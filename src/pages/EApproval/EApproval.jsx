import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./styles/ApprovalPage.css";
import { caxios } from "../../config/config";

function EApproval() {
  const navigate = useNavigate();
  const { status = "A" } = useParams();
  const [docs, setDocs] = useState([]);
  const [openFolder1, setOpenFolder1] = useState(false); // 문서함
  const [openFolder2, setOpenFolder2] = useState(false); // 진행 중 문서
  

  // 상태 코드 → 한글 이름 매핑
  const statusMap = {
    show:"전체",
    pending: "승인 대기",
    in_progress: "진행 중",
    rejected: "반려",
    scheduled:"확인",
    in_progress: "진행",
    approved:"예정",
    TEMP: "임시저장"
  };

  // 데이터 로드
  useEffect(() => {
    const url = `/Eapproval/${status ==="show"?"A":status}`;
    caxios
      .get(url)
      .then((res) => {
        let data=res.data;

        if(status==="A" || status==="show"){
            data=data.filter(
            (doc)=>doc.status !=="TEMP"
            );
        }
        if(status === "TEMP"){
            data=data.filter(
                (doc)=>doc.status==="TEMP"
            );
        }
        setDocs(data)
      })
      .catch((err) => console.error(err));
  }, [status]);

  // 메뉴 탭
  const tabCodes = [
    { code: "show", label: "전체" },
    { code: "rejected", label: "반려" },
    { code:"pass",label:"기안"},
    { code:"b", label:"결재"}
  ];

  const foldertabCodes = [
    { code: "A", label: "전체" },
    { code: "pending", label: "승인 대기" },
    { code: "scheduled", label: "확인" },
    { code: "approved", label: "예정" },
    { code: "in_progress", label: "진행" },
  ];

  return (
    <div className="approval-container">
      {/* 헤더 */}
      <div className="approval-header">
        <h2>전자결재</h2>
        <button
          className="write-button"
          onClick={() => navigate("/Eapproval/write")}
        >
          + 작성하기
        </button>
      </div>

      {/* 폴더 메뉴 한 줄 */}
      <div className="menu-row">
        {/* 진행 중 문서 */}
        <div className="menu-section">
          <button
            className="menu-main-btn"
            onClick={() => setOpenFolder2(!openFolder2)}
          >
            <span>📂 진행 중 문서</span>
            <span className={`arrow ${openFolder2 ? "open" : ""}`}>▼</span>
          </button>

          {openFolder2 && (
            <div className="submenu">
              {foldertabCodes.map((tab) => (
                <button
                  key={tab.code}
                  onClick={() => navigate(`/Eapproval/${tab.code}`)}
                  className={`submenu-btn ${
                    status === tab.code ? "active" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 문서함 */}
        <div className="menu-section">
          <button
            className="menu-main-btn"
            onClick={() => setOpenFolder1(!openFolder1)}
          >
            <span>📂 문서함</span>
            <span className={`arrow ${openFolder1 ? "open" : ""}`}>▼</span>
          </button>

          {openFolder1 && (
            <div className="submenu">
              {tabCodes.map((tab) => (
                <button
                  key={tab.code}
                  onClick={() => navigate(`/Eapproval/${tab.code}`)}
                  className={`submenu-btn ${
                    status === tab.code ? "active" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="menu-section">
          <button
            className={`menu-main-btn ${status === "TEMP" ? "active" : ""}`}
            onClick={() => navigate("/Eapproval/TEMP")}
          >
            📝 임시 저장
          </button>
        </div>
        <div>
            설정
        </div>
      </div>


      

      {/* 테이블 */}
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
  onClick={() => navigate(`/Eapproval/detail/${doc.seq}`)}
                >
     {doc.title}
    </td>
    <td>{doc.writer}</td>
    <td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td>
  < td>{statusMap[doc.status]}</td>
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
