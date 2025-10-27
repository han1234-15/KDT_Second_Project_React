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

  // ✅ 사장 여부
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
    if (!selectedDates.length) return message.error("날짜를 선택하세요.");
    if (!vacReason.trim()) return message.warning("휴가 사유를 입력해야 합니다.");
    if (!isCEO && !approverList.length)
      return message.warning("결재선을 설정하세요.");
    if ((vacType === "half_am" || vacType === "half_pm") && selectedDates.length !== 1) {
      return message.warning("반차는 하루만 선택 가능합니다.");
    }

    const payload = {
      rank: applicant?.rank_code, // ✅ 백엔드에서 사장 여부 판단
      items: selectedDates.map((d) => ({
        date: d,
        type: vacType,
        reason: vacReason,
      })),
      approvers: approverList,
      references: referenceList,
    };

    try {
      await caxios.post("/leave/request", payload);

      // ✅ 사장 알림 + 일반 직원 알림 구분
      if (isCEO) {
        alert("휴가가 즉시 승인 처리되었습니다.");
      } else {
        alert("휴가 신청이 완료되었습니다. 결재 대기 중입니다.");
      }

      onClose();
      refresh();
    } catch (err) {
      console.error("❌ 휴가 신청 실패:", err);
      message.error("휴가 신청 중 문제가 발생했습니다.");
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="75%">
      {/* ✅ 사장이 아닐 때만 결재선 UI 렌더링 */}
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
                      ? referenceList
                          .map((r) => `${r.name} (${r.rank_code})`)
                          .join(", ")
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

      {/* ✅ 선택 날짜 표시 */}
      <div className={styles.selectedDateBox}>
        <strong>선택된 날짜: </strong>
        {selectedDates.length ? selectedDates.sort().join(", ") : "날짜를 선택하세요"}
      </div>

      {/* ✅ 캘린더 */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={selectedEvents}
        height={450}
        locale="ko"
      />

      {/* 휴가 타입 + 사유 */}
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

      {/*  버튼 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>취소</Button>
        <Button type="primary" onClick={submitVacation}>
          신청
        </Button>
      </div>

      {/*  결재선 모달 */}
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
