// src/domains/approval/EApprovalForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config";

const DOC_TYPES = ["공통"]; // 필요시 확장
const TEMPLATES = ["업무연락", "품의서", "회의록"];
const RETENTIONS = ["1년", "3년", "5년", "10년", "영구"];
const SECURITIES = ["A등급", "B등급", "C등급"];

export default function EApprovalForm({ mode = "write", initialData = null, seq = null }) {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // 기본 설정
    docType: "공통",
    template: "업무연락",
    writer: "",        // ✅ 작성자 수정 가능
    retention: "5년",
    security: "C등급",

    // 결재선 (4줄 고정)
    approvers: "",     // 결재
    references: "",    // 참조
    receivers: "",     // 수신
    subReferences: "", // (수신)참조

    // 본문
    title: "",
    comments: "",
  });

    const sendTestNotice = async (receiver_id, type, message) => {
    await caxios.post("/notification/send", {
      receiver_id: receiver_id, // 실제 로그인 ID로 전달받을 사람.
      type: type,
      message: message,
      created_at: new Date().toISOString(),
    });
    //alert("테스트 알림 전송 완료 ✅");
  };

  // edit 모드면 detail에서 받은 값으로 초기화
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        docType: initialData.docType ?? "공통",
        template: initialData.template ?? "업무연락",
        writer: initialData.writer ?? "",
        retention: initialData.retention ?? "5년",
        security: initialData.security ?? "C등급",

        approvers: initialData.approvers ?? "대표이사",
        references: initialData.references ?? "",
        receivers: initialData.receivers ?? "",
        subReferences: initialData.subReferences ?? "",

        title: initialData.title ?? "",
        comments: initialData.comments ?? "",
      });
    }
  }, [mode, initialData]);

  const onChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

 const submitToWriteApi = async (status) => {
  try {
    setSubmitting(true);

    const payload = { ...formData, status };
    if (seq) payload.seq = seq;

    const res = await caxios.post("/Eapproval/write", payload);
    const savedSeq = res?.data?.seq ?? seq;

    if (status === "TEMP") {
      navigate("/Eapproval/TEMP");
    } else {

      
     // ✅ 변경 후 (컨트롤러와 정확히 매칭)
const lineRes = await caxios.get(`/Eapproval/line/${savedSeq}`);
console.log("결재라인 응답:", lineRes.data);

const firstApprover =
  lineRes.data?.find(a => a.ORDERNO === 1 || a.orderNo === 1 || a.approver_order === 1);

if (firstApprover) {
  await sendTestNotice(
    firstApprover.APPROVER_ID || firstApprover.approver_id,
    "결재 요청",
    `${formData.writer}님이 결재를 상신했습니다.`
  );
}

      navigate(`/Eapproval/detail/${savedSeq}`);
    }
  } catch (e) {
    console.error("save/submit error:", e);
    alert("저장 중 오류가 발생했습니다.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="approval-edit-container">
      <h2>{mode === "edit" ? "임시저장 문서 수정" : "전자결재 작성"}</h2>

      {/* 기본 설정 */}
      <section className="box">
        <h3>기본 설정</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* 문서 종류 */}
          <div>
            <label>문서 종류</label>
            <div className="flex gap-2">
              <select value={formData.docType} onChange={onChange("docType")}>
                {DOC_TYPES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <select value={formData.template} onChange={onChange("template")}>
                {TEMPLATES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 작성자 */}
          <div>
            <label>작성자</label>
            <input
              type="text"
              placeholder="작성자"
              value={formData.writer}
              onChange={onChange("writer")}
            />
          </div>

          {/* 보존 연한 */}
          <div>
            <label>보존 연한</label>
            <select value={formData.retention} onChange={onChange("retention")}>
              {RETENTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* 보안 등급 */}
          <div>
            <label>보안 등급</label>
            <select value={formData.security} onChange={onChange("security")}>
              {SECURITIES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 결재선 설정 */}
      <section className="box">
        <h3>결재선 설정</h3>
        <div className="approval-line-table">
          <div className="row header">
            <div className="col label" />
            <div className="col value">대표이사</div>
            <div className="col action">
              <button type="button" className="btn-primary" disabled>결재</button>
            </div>
          </div>

          <div className="row">
            <div className="col label">결재</div>
            <div className="col value">
              <input
                placeholder="클릭 후 입력"
                value={formData.approvers}
                onChange={onChange("approvers")}
              />
            </div>
          </div>

          <div className="row">
            <div className="col label">참조</div>
            <div className="col value">
              <input
                placeholder="클릭 후 입력"
                value={formData.references}
                onChange={onChange("references")}
              />
            </div>
          </div>

          <div className="row">
            <div className="col label">수신</div>
            <div className="col value">
              <input
                placeholder="클릭 후 입력"
                value={formData.receivers}
                onChange={onChange("receivers")}
              />
            </div>
          </div>

          <div className="row">
            <div className="col label">(수신)참조</div>
            <div className="col value">
              <input
                placeholder="클릭 후 입력"
                value={formData.subReferences}
                onChange={onChange("subReferences")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 제목 / 본문 */}
      <section className="box">
        <div>
          <label>제목</label>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={onChange("title")}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>본문</label>
          <textarea
            rows={10}
            placeholder="내용을 입력하세요"
            value={formData.comments}
            onChange={onChange("comments")}
          />
        </div>
      </section>

      {/* 버튼 영역 */}
      <div className="button-area">
        <button type="button" onClick={() => navigate(-1)} disabled={submitting}>
          취소
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => submitToWriteApi("TEMP")}
          disabled={submitting}
        >
          임시저장
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => submitToWriteApi("SUBMITTED")}
          disabled={submitting}
        >
          결재 상신
        </button>
      </div>
    </div>
  );
}
