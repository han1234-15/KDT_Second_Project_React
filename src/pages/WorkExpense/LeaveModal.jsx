import React, { useState } from "react";
import { Modal, Select, Input, message, Button } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ApprovalLineModal from "./ApprovalLineModal";
import { caxios } from "../../config/config";
import styles from "./style/LeaveModal.module.css";

const LeaveModal = ({ open, onClose, refresh, applicant }) => {
  const [vacType, setVacType] = useState("annual");
  const [vacReason, setVacReason] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approverList, setApproverList] = useState([]);
  const [referenceList, setReferenceList] = useState([]);

  // ✅ 중복 제출 방지 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCEO = applicant?.rank_code === "사장";

  const handleDateClick = (info) => {
    const date = info.dateStr;
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const selectedEvents = selectedDates.map((d) => ({
    title: "선택됨",
    start: d,
    allDay: true,
    display: "background",
    backgroundColor: "#82b1ff",
  }));

  const applyApprovalLine = ({ approverList, referenceNames }) => {
    setApproverList(approverList);
    setReferenceList(referenceNames);
  };

 
const submitVacation = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  if (!selectedDates.length) {
    message.error("날짜를 선택하세요.");
    setIsSubmitting(false);
    return;
  }

  if (!vacReason.trim()) {
    message.warning("휴가 사유를 입력해야 합니다.");
    setIsSubmitting(false);
    return;
  }

  if (!isCEO && !approverList.length) {
    message.warning("결재선을 설정하세요.");
    setIsSubmitting(false);
    return;
  }

  if ((vacType === "half_am" || vacType === "half_pm") && selectedDates.length !== 1) {
    message.warning("반차는 하루만 선택 가능합니다.");
    setIsSubmitting(false);
    return;
  }

const payload = {
  items: selectedDates.map((d) => ({
    date: d,
    type: vacType,
    reason: vacReason,
  })),
  approvers: approverList.map((a, idx) => ({
    id: a.id,
    name: a.name,
    rank_code: a.rank_code,
    orderNo: idx + 1,
  })),
  references: referenceList.map((r) => ({
    id: r.id,          
    name: r.name,
    rank_code: r.rank_code,
  })),
};


  try {
    await caxios.post("/leave/request", payload);
    message.success("휴가 신청 완료");
    onClose();
    refresh();
  } catch (err) {
    console.error(err);
    message.error("휴가 신청 실패");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="75%">
      {!isCEO && (
        <div className={styles.approvalTableBox}>
          <div className={styles.approvalTableTitle}>
            <span>결재선</span>
            <Button size="small" type="primary" onClick={() => setApprovalModalOpen(true)}>
              + 결재선 설정
            </Button>
          </div>

          <table className={styles.approvalTable}>
            <thead>
              <tr>
                <th style={{ width: 80 }}>구분</th>
                {approverList.map((a, i) => (
                  <th key={i}>{`${a.name} (${a.rank_code})`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.leftCol}>결재</td>
                {approverList.map((_, i) => (
                  <td key={i}>-</td>
                ))}
              </tr>
              <tr>
                <td className={styles.leftCol}>참조</td>
                {approverList.length > 0 ? (
                  <td colSpan={approverList.length}>
                    {referenceList.length
                      ? referenceList.map((r) => `${r.name} (${r.rank_code})`).join(", ")
                      : "없음"}
                  </td>
                ) : (
                  <td>없음</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.selectedDateBox}>
        <strong>선택된 날짜: </strong>
        {selectedDates.length ? selectedDates.sort().join(", ") : "날짜를 선택하세요"}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={selectedEvents}
        height={450}
        locale="ko"
      />

      <div style={{ marginTop: 20 }}>
        <Select
          value={vacType}
          onChange={setVacType}
          style={{ width: "100%", marginBottom: 10 }}
          options={[
            { value: "annual", label: "연차" },
            { value: "half_am", label: "오전 반차" },
            { value: "half_pm", label: "오후 반차" },
            { value: "official", label: "공가" },
            { value: "family", label: "경조" },
            { value: "sick", label: "병가" },
            { value: "business_trip", label: "출장" },
          ]}
        />
        <Input.TextArea
          placeholder="사유 입력"
          value={vacReason}
          onChange={(e) => setVacReason(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>취소</Button>

        {/* ✅ 중복 신청 방지 버튼 처리 */}
        <Button type="primary" onClick={submitVacation} disabled={isSubmitting}>
          {isSubmitting ? "처리중..." : "신청"}
        </Button>
      </div>

      {!isCEO && (
        <ApprovalLineModal
          open={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          onApply={applyApprovalLine}
          initialApprovers={approverList}
          initialReferences={referenceList}
          applicant={applicant}
        />
      )}
    </Modal>
  );
};

export default LeaveModal;
