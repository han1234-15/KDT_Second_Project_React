import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { caxios } from "../../config/config";

const ApprovalLineModal = ({
  open,
  onClose,
  onApply,
  initialApprovers = [],
  initialReferences = [],
  applicant
}) => {
  // ✅ 후보자 목록 가져오기
  const [candidates, setCandidates] = useState([]);
  useEffect(() => {
    caxios.get("/Eapproval/candidates").then((res) => {
      setCandidates(res.data || []);
    });
  }, []);

  // ✅ 결재자 / 참조자 상태
  const [approvers, setApprovers] = useState(initialApprovers);
  const [referenceNames, setReferenceNames] = useState(initialReferences);

  // ✅ 모달 open 시 초기 세팅
  useEffect(() => {
    if (open) {
      setApprovers(initialApprovers);
      setReferenceNames(initialReferences);
    }
  }, [open, initialApprovers, initialReferences]);

  // ✅ 후보 목록 (기안자 + 결재자 제외)
  const available = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.id !== applicant?.id &&
          !approvers.some((a) => a.id === c.id)
      ),
    [candidates, applicant, approvers]
  );

  // ✅ Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...approvers];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setApprovers(items);
  };

  // ✅ 결재자 추가
  const addApprover = (id) => {
    if (!id) return;
    const found = available.find((u) => u.id === id);
    if (found) setApprovers((prev) => [...prev, found]);
  };

  // ✅ 결재자 삭제
  const removeApprover = (id) => {
    setApprovers((prev) => prev.filter((a) => a.id !== id));
  };

  // ✅ 참조자 토글 (name 저장)
  const toggleReference = (name) => {
    setReferenceNames((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
  };

  // ✅ 저장 후 부모 전달
  const applyAndClose = () => {
    onApply?.({ approverList: approvers, referenceNames });
    onClose?.();
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={applyAndClose} okText="저장" cancelText="취소" width={600}>
      <h3 style={{ marginBottom: 12 }}>결재선 설정</h3>

      {/* ✅ 구분 실시간 표시 영역 */}
      <table style={{ width: "100%", marginBottom: 12, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <th style={{ width: 80, textAlign: "left" }}>결재</th>
            <td>
              {approvers.length > 0
                ? approvers.map(a => `${a.name} (${a.rank_code})`).join(", ")
                : "-"}
            </td>
          </tr>
          <tr>
            <th style={{ textAlign: "left" }}>참조</th>
            <td>
              {referenceNames.length > 0
                ? referenceNames.join(", ")
                : "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ✅ 결재자 선택 */}
      <select
        defaultValue=""
        onChange={(e) => {
          addApprover(e.target.value);
          e.target.value = "";
        }}
        style={{ padding: "6px 10px", marginBottom: 10 }}
      >
        <option value="">결재자 선택</option>
        {available.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.rank_code})
          </option>
        ))}
      </select>

      {/* ✅ Drag 리스트 */}
      <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8, background: "#fafafa", marginBottom: 16 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="approver-line">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} style={{ listStyle: "none", padding: 0 }}>
                {approvers.map((a, i) => (
                  <Draggable key={a.id} draggableId={a.id} index={i}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: 10,
                          marginBottom: 8,
                          border: "1px solid #ccc",
                          borderRadius: 6,
                          background: "#fff",
                          ...provided.draggableProps.style
                        }}
                      >
                        {i + 1}. {a.name} ({a.rank_code})
                        <button onClick={() => removeApprover(a.id)} style={{ color: "red" }}>삭제</button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {approvers.length === 0 && (
                  <li style={{ padding: 6, textAlign: "center", color: "#888" }}>결재자를 추가하세요.</li>
                )}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* ✅ 참조 체크 */}
      <h4>참조</h4>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {candidates
          .filter((c) => !approvers.some((a) => a.id === c.id)) // 결재자 제외
          .map((u) => (
            <label key={u.id}>
              <input
                type="checkbox"
                checked={referenceNames.includes(u.name)}
                onChange={() => toggleReference(u.name)}
              />
              &nbsp;{u.name} ({u.rank_code})
            </label>
          ))}
      </div>
    </Modal>
  );
};

export default ApprovalLineModal;
