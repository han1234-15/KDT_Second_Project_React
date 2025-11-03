import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { caxios } from "../../config/config";

// ✅ 직급 한글 매핑
const ranks = {
  J001: "사원",
  J002: "주임",
  J003: "대리",
  J004: "과장",
  J005: "차장",
  J006: "부장",
  J007: "이사",
  J008: "부사장",
  J009: "사장"
};

const ApprovalLineModal = ({
  open,
  onClose,
  onApply,
  initialApprovers = [],
  initialReferences = [],
  applicant
}) => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    caxios.get("/Eapproval/candidates").then((res) => {
      setCandidates(res.data || []);
    });
  }, []);

  const [approvers, setApprovers] = useState(initialApprovers);
  const [referenceList, setReferenceList] = useState(initialReferences);

  // ✅ 사장 자동 포함 + 삭제 불가 적용
  useEffect(() => {
    if (open && candidates.length > 0) {
      const ceo = candidates.find((c) => c.rank_code === "J009");
      let next = [...initialApprovers];

      if (ceo && !next.some((a) => a.id === ceo.id)) {
        next.push(ceo);
      }

      setApprovers(next);
      setReferenceList(initialReferences);
    }
  }, [open, candidates, initialApprovers, initialReferences]);

  // ✅ 후보 리스트 필터링
  const available = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.id !== applicant?.id &&
          !approvers.some((a) => a.id === c.id) &&
          !referenceList.some((r) => r.id === c.id)
      ),
    [candidates, approvers, referenceList, applicant]
  );

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...approvers];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setApprovers(items);
  };

  const addApprover = (id) => {
    const found = available.find((u) => u.id === id);
    if (found) setApprovers((prev) => [...prev, found]);
  };

  const removeApprover = (id) => {
    const target = approvers.find((a) => a.id === id);
    if (target?.rank_code === "J009") return; // ✅ 사장은 삭제 불가
    setApprovers((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleReference = (user) => {
    setReferenceList((prev) =>
      prev.some((r) => r.id === user.id)
        ? prev.filter((r) => r.id !== user.id)
        : [...prev, user]
    );
  };

  const applyAndClose = () => {
    onApply({ approverList: approvers, referenceList });
    onClose();
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={applyAndClose} okText="저장" cancelText="취소" width={600}>
      <h3 style={{ marginBottom: 12 }}>결재선 설정</h3>

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
            {u.name} ({ranks[u.rank_code]})
          </option>
        ))}
      </select>

      {/* Drag & Drop */}
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
                        {i + 1}. {a.name} ({ranks[a.rank_code]})

                        {a.rank_code !== "J009" ? (
                          <button onClick={() => removeApprover(a.id)} style={{ color: "red" }}>삭제</button>
                        ) : (
                          <span style={{ color: "#999", fontSize: 12 }}>고정</span>
                        )}
                      </li>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <h4>참조</h4>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {candidates
          .filter((u) => !approvers.some((a) => a.id === u.id))
          .map((u) => (
            <label key={u.id}>
              <input
                type="checkbox"
                checked={referenceList.some((r) => r.id === u.id)}
                onChange={() => toggleReference(u)}
              />
              &nbsp;{u.name} ({ranks[u.rank_code]})
            </label>
          ))}
      </div>
    </Modal>
  );
};

export default ApprovalLineModal;
