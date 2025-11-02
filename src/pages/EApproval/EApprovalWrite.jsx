import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/ApprovalWrite.css";
import approveImg from "./images/승인.jpg";
import rejectImg from "./images/반려.png";
import { caxios } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import ApprovalLineModal from "../WorkExpense/ApprovalLineModal";

function EApprovalWrite() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false); // 승인/반려 모달
  const [approvalModalOpen, setApprovalModalOpen] = useState(false); // ✅ 결재선 설정 모달

  const [approvalResult, setApprovalResult] = useState(null);

  const [formData, setFormData] = useState({
    docType: "",
    template: "",
    writer: "",
    writer_id: "",
    dept_code: "",
    rank_code: "",
    retention: "5년",
    security: "C등급",
    title: "",
    comments: "",
  });

  // ✅ 결재선 / 참조 리스트 상태
  const [approvers, setApprovers] = useState([]);
  const [referenceList, setReferenceList] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);

      // ✅ loginId 선언을 여기서 먼저
      const loginId = decoded.sub;

      setFormData((prev) => ({
        ...prev,
        writer: decoded.name,
        writer_id: loginId
      }));

      // ✅ 사용자 정보 DB 조회
      caxios.get(`/Eapproval/member/${loginId}`)
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            dept_code: res.data.dept_code,
            rank_code: res.data.rank_code
          }));
        })
        .catch(() => {
          alert("⚠️ 사용자 정보를 불러오지 못했습니다.");
        });
    }
  }, []);



  useEffect(() => {
    if (name) {
      caxios.get(`/Eapproval/temp/${name}`)
        .then((res) => res.data && setFormData(res.data))
        .catch(() => { });
    }
  }, [name]);

  const templateOptions = {
    공통: ["업무연락", "품의서", "회의록"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ 결재선 결과 반영
  const handleApprovalLineApply = ({ approverList, referenceNames }) => {
    setApprovers(approverList);
    setReferenceList(referenceNames);
    setApprovalModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    caxios.post(`/Eapproval/write`, {
      ...formData,
      approvers,
      referenceList,
    })
      .then(() => {
        alert("결재 문서가 성공적으로 등록되었습니다.");
        navigate("/Eapproval/A");
      })
      .catch(() => alert("등록 중 오류 발생"));
  };



  const isDocSelected = formData.docType && formData.template;

  return (
    <div className="approval-write-container">

      <h3 className="section-title">기본 설정</h3>
      <table className="base-table">
        <tbody>
          <tr>
            <th>문서 종류</th>
            <td>
              <select name="docType" value={formData.docType} onChange={handleChange}>
                <option value="">선택</option>
                <option value="공통">공통</option>
              </select>

              <select
                name="template"
                value={formData.template}
                onChange={handleChange}
                disabled={!formData.docType}
              >
                <option value="">양식 선택</option>
                {templateOptions[formData.docType]?.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </td>

            <th>작성자</th>
            <td>{formData.writer}</td>
          </tr>
        </tbody>
      </table>

      {!isDocSelected && (
        <div className="notice-box">✏️ 문서 종류와 양식을 선택하면 결재선이 표시됩니다.</div>
      )}

      {isDocSelected && (
        <>
          <h3 className="section-title">결재선 설정</h3>
          <div className="approval-line-table">
            <table>
              <thead>
                <tr>
                  <th className="head-cell">
                    <button
                      onClick={() => {
                        if (!formData.rank_code || !formData.dept_code) {
                          alert("사용자 정보가 아직 로딩 중입니다. 잠시 후 다시 시도하세요.");
                          return;
                        }
                        setApprovalModalOpen(true);
                      }}
                    >
                      ＋
                    </button>
                  </th>

                  {approvers.length === 0 ? (
                    <th>결재자를 선택하세요</th>
                  ) : (
                    approvers.map((a, i) => (
                      <th key={i}>{a.name} ({a.rank_code})</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label">결재</td>
                  {approvers.map((a, i) => (
                    <td key={i} className="empty">-</td>
                  ))}
                </tr>
                <tr>
                  <td className="label">참조</td>
                  <td colSpan={approvers.length}>
                    {referenceList.length > 0
                      ? referenceList.map((r) => `${r.name}(${r.rank_code}) `)
                      : "없음"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <ApprovalLineModal
            open={approvalModalOpen}
            onClose={() => setApprovalModalOpen(false)}
            onApply={handleApprovalLineApply}
            initialApprovers={approvers}
            initialReferences={referenceList}
            applicant={formData}
          />

          <div className="input-block">
            <label>제목</label>
            <input name="title" value={formData.title} onChange={handleChange} />
          </div>

          <div className="input-block">
            <label>본문</label>
            <textarea name="comments" value={formData.comments} onChange={handleChange} rows="10"></textarea>
          </div>

          <div className="bottom-buttons">
            <button className="temp"></button>
            <button className="submit" onClick={handleSubmit}>결재 상신</button>
          </div>
        </>
      )}
    </div>
  );
}

export default EApprovalWrite;
