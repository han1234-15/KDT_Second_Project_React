import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/ApprovalWrite.css";
import { caxios } from "../../config/config";
import { jwtDecode } from "jwt-decode";
import ApprovalLineModal from "../WorkExpense/ApprovalLineModal";

// ✅ 직급 변환 매핑
const ranks = {
  J001: "사원",
  J002: "주임",
  J003: "대리",
  J004: "과장",
  J005: "차장",
  J006: "부장",
  J007: "이사",
  J008: "부사장",
  J009: "사장",
};

function EApprovalWrite() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

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

  const [approvers, setApprovers] = useState([]);
  const [referenceList, setReferenceList] = useState([]);

  // ✅ 로그인 사용자 정보 셋팅
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const loginId = decoded.sub;

    setFormData((prev) => ({
      ...prev,
      writer: decoded.name,
      writer_id: loginId
    }));

    caxios.get(`/Eapproval/member/${loginId}`)
      .then((res) => {
        setFormData((prev) => ({
          ...prev,
          dept_code: res.data.dept_code,
          rank_code: res.data.rank_code
        }));
      })
      .catch(() => alert("⚠️ 사용자 정보를 불러오지 못했습니다."));
  }, []);

  // ✅ 임시저장 불러오기
  useEffect(() => {
    if (name) {
      caxios.get(`/Eapproval/temp/${name}`)
        .then((res) => {
          if (!res.data) return;

          setFormData((prev) => ({ ...prev, ...res.data }));
          setApprovers(Array.isArray(res.data.approvers) ? res.data.approvers : []);
          setReferenceList(Array.isArray(res.data.referenceList) ? res.data.referenceList : []);
        })
        .catch(() => {});
    }
  }, [name]);

  const templateOptions = {
    공통: ["업무연락", "품의서", "회의록"],
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ 모달에서 선택된 결재선 반영
  const handleApprovalLineApply = ({ approverList, referenceList }) => {
    setApprovers(approverList);
    setReferenceList(referenceList);
    setApprovalModalOpen(false);
  };

const handleSubmit = () => {
  if (!approvers || approvers.length === 0) {
    alert("🚨 결재선을 최소 1명 이상 지정하세요.");
    return;
  }

  const orderedApprovers = approvers.map((a, i) => ({
    ...a,
    approver_order: i + 1   // ✅ DB와 MyBatis가 받는 정확한 필드명
  }));

  console.log("✅ 최종 전송되는 결재선:", orderedApprovers);

  caxios.post(`/Eapproval/write`, {
    ...formData,
    approvers: orderedApprovers,  // ✅ 여기 순서 중요
    referenceList,
  })
    .then(() => {
      alert("✅ 결재 문서가 등록되었습니다.");
      navigate("/Eapproval/A");
    })
    .catch(() => alert("⚠️ 등록 중 오류가 발생했습니다."));
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

              <select name="template" value={formData.template} onChange={handleChange} disabled={!formData.docType}>
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

      {!isDocSelected && <div className="notice-box">✏️ 문서 종류와 양식을 선택하면 결재선이 표시됩니다.</div>}

      {isDocSelected && (
        <>
          <h3 className="section-title">결재선 설정</h3>
          <div className="approval-line-table">
            <table>
              <thead>
                <tr>
                  <th className="head-cell">
                    <button onClick={() => setApprovalModalOpen(true)}>＋</button>
                  </th>

                  {(approvers?.length ?? 0) === 0 ? (
                    <th>결재자를 선택하세요</th>
                  ) : (
                    approvers.map((a, i) => (
                      <th key={i}>{a.name} ({ranks[a.rank_code]})</th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="label">결재</td>
                  {approvers.map((_, i) => <td key={i}>-</td>)}
                </tr>

                <tr>
                  <td className="label">참조</td>
                  <td colSpan={(approvers?.length || 1)}>
                    {(referenceList?.length ?? 0) > 0
                      ? referenceList.map((r) => `${r.name}(${ranks[r.rank_code]}) `)
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
            <button className="submit" onClick={handleSubmit}>결재 상신</button>
          </div>
        </>
      )}
    </div>
  );
}

export default EApprovalWrite;
