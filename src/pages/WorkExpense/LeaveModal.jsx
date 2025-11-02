import React, { useState } from "react";
import { Modal, Select, Input, Button } from "antd";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCEO = applicant?.rank_code === "사장";

  // ✅ 오늘 날짜 (과거 선택 막기)
  const today = new Date().toISOString().split("T")[0];

  const handleDateClick = (info) => {
    const date = info.dateStr;

    if (date < today) {
      alert("과거 날짜는 선택할 수 없습니다.");
      return;
    }

    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // ✅ 과거 날짜 시각적 구분 (회색 배경)
  const dayCellClassNames = (arg) => {
    const date = arg.date.toISOString().split("T")[0];
    return date < today ? styles.pastDay : "";
  };

  const selectedEvents = selectedDates.map((d) => ({
    start: d,
    allDay: true,
    display: "background",
    backgroundColor: "#82b1ff",
  }));

  const applyApprovalLine = ({ approverList, referenceNames }) => {
    setApproverList(approverList);
    setReferenceList(referenceNames);
  };

  // ✅ 신청 처리
  const submitVacation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!selectedDates.length) {
      alert("날짜를 선택해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (!vacReason.trim()) {
      alert("휴가 사유를 반드시 입력해야 합니다.");
      setIsSubmitting(false);
      return;
    }

    if (!isCEO && !approverList.length) {
      alert("결재선을 설정해야 합니다.");
      setIsSubmitting(false);
      return;
    }

    if ((vacType === "half_am" || vacType === "half_pm") && selectedDates.length !== 1) {
      alert("반차는 하루만 선택 가능합니다.");
      setIsSubmitting(false);
      return;
    }

    // ✅ 휴가는 한 번에 5일까지만 가능
    if (vacType !== "half_am" && vacType !== "half_pm" && selectedDates.length > 5) {
      alert("휴가는 한 번에 최대 5일까지만 신청할 수 있습니다.");
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
        ...a,
        orderNo: idx + 1,
      })),
      references: referenceList,
    };

    try {
      await caxios.post("/leave/request", payload);
      alert("휴가 신청 완료되었습니다.");
      onClose();
      refresh();
    } catch {
      alert("휴가 신청 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="75%">
      {/* ✅ 사장만 결재선 숨김 */}
      {!isCEO && (
        <div className={styles.approvalTableBox}>
          <div className={styles.approvalTableTitle}>
            <span>결재선</span>
            <Button size="small" type="primary" onClick={() => setApprovalModalOpen(true)}>
              + 결재선 설정
            </Button>
          </div>
        </div>
      )}

      <div className={styles.selectedDateBox}>
        <strong>선택된 날짜:</strong> {selectedDates.length ? selectedDates.sort().join(", ") : "없음"}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={selectedEvents}
        dayCellClassNames={dayCellClassNames} // ✅ 회색 처리 적용
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
            { value: "half_pm", label: "오후 반차" }
          ]}
        />
        <Input.TextArea placeholder="사유 입력" value={vacReason} onChange={(e) => setVacReason(e.target.value)} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>취소</Button>
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
