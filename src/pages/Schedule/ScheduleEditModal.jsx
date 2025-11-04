import useAuthStore from "../../store/authStore";
import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Select, DatePicker, Alert } from "antd";
import dayjs from "dayjs";
import { caxios } from "../../config/config";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import styles from "./Schedule.module.css";

const { Option } = Select;

// 시간 / 분 리스트
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const ScheduleEditModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        seq: initialData.seq,
        category: initialData.category || "1",
        title: initialData.title || "",
        content: initialData.content || "",
        startAt: dayjs(initialData.startAt),
        endAt: dayjs(initialData.endAt),
        place: initialData.place || "",
        color: initialData.color || "#6BB5FF",
        importantYn: initialData.importantYn || "N",
        created_id: initialData.created_id || "testUser",
      });
      setErrorMsg("");
      setSaving(false);
    }
  }, [isOpen, initialData]);

  if (!form) return null;

  const toggleImportant = () =>
    setForm((p) => ({ ...p, importantYn: p.importantYn === "Y" ? "N" : "Y" }));

  const validate = () => {
    const missing = [];
    if (!form.title?.trim()) missing.push("제목");
    if (!form.startAt || !dayjs(form.startAt).isValid()) missing.push("시작일");
    if (!form.endAt || !dayjs(form.endAt).isValid()) missing.push("종료일");

    if (missing.length > 0) {
      setErrorMsg(`${missing.join(", ")}을 입력해주세요`);
      return false;
    }

    const start = dayjs(form.startAt);
    const end = dayjs(form.endAt);
    if (end.isBefore(start)) {
      setErrorMsg("종료일시는 시작일시보다 이후여야 합니다.");
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const handleEdit = async () => {
    if (saving) return;
    if (!validate()) return;

    const payload = {
      seq: form.seq,
      category: form.category,
      title: form.title,
      content: form.content || "",
      startAt: dayjs(form.startAt).toISOString(),
      endAt: dayjs(form.endAt).toISOString(),
      place: form.place || "",
      color: form.color || "#6BB5FF",
      importantYn: form.importantYn || "N",
      created_id: form.created_id,
      updated_id: "testUser",
    };

    try {
      setSaving(true);
      await caxios.put(`/schedule/${form.seq}`, payload);
      onSuccess(payload);
      onClose();
    } catch (e) {
      setErrorMsg("일정 수정 실패. 입력값을 다시 확인해주세요.");
      setSaving(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={700}
      title="일정 수정"
      onCancel={onClose}
      destroyOnHidden
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.footerLeft}>
            {errorMsg && (
              <Alert
                type="warning"
                message={errorMsg}
                showIcon
                style={{ padding: "6px 10px" }}
              />
            )}
          </div>
          <div className={styles.footerRight}>
            <Button onClick={onClose}>취소</Button>
            <Button type="primary" onClick={handleEdit} loading={saving}>
              저장
            </Button>
          </div>
        </div>
      }
    >
      <hr />
      <div className={styles.form}>
        {/* 캘린더 */}
        <div className={styles.row}>
          <label>캘린더</label>
          <Select
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            style={{ width: 558 }}
          >
            <Option value="1">개인 일정</Option>
            <Option value="2">전사 일정</Option>
            <Option value="3">프로젝트</Option>
          </Select>
        </div>

        {/* 색상 & 중요 */}
        <div className={styles.colorRow}>
          <label>색상</label>
          <div className={styles.colorWrapper}>
            <div className={styles.colorPalette}>
              {[
                "#ff6b6b",
                "#ffb56b",
                "#fff06b",
                "#6bff8d",
                "#6bb5ff",
                "#8a8a9f",
                "#b06bff",
              ].map((c) => (
                <div
                  key={c}
                  className={`${styles.colorBox} ${
                    form.color === c ? styles.selected : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
            <div className={styles.starBox} onClick={toggleImportant}>
              {form.importantYn === "Y" ? (
                <StarIcon className={styles.starActive} />
              ) : (
                <StarBorderIcon className={styles.starInactive} />
              )}
              <span className={styles.starText}>중요</span>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div className={styles.row}>
          <label>제목</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목을 입력하세요"
            style={{ width: 558 }}
          />
        </div>

        {/* 일시 */}
        <div className={styles.row}>
          <label>일시</label>
          <div className={styles.datetimeRow}>
            {/* 시작 */}
            <DatePicker
              value={form.startAt}
              onChange={(d) => setForm({ ...form, startAt: d })}
            />
            {(() => {
              const startHour = form.startAt ? form.startAt.hour() : 0;
              const startMinute = form.startAt ? form.startAt.minute() : 0;
              return (
                <>
                  <Select
                    value={startHour}
                    style={{ width: 70 }}
                    onChange={(h) =>
                      setForm({
                        ...form,
                        startAt: form.startAt.clone().hour(h),
                      })
                    }
                  >
                    {hours.map((h) => (
                      <Option key={h} value={h}>
                        {h.toString().padStart(2, "0")}시
                      </Option>
                    ))}
                  </Select>
                  <Select
                    value={startMinute}
                    style={{ width: 70 }}
                    onChange={(m) =>
                      setForm({
                        ...form,
                        startAt: form.startAt.clone().minute(m),
                      })
                    }
                  >
                    {minutes.map((m) => (
                      <Option key={m} value={m}>
                        {m.toString().padStart(2, "0")}분
                      </Option>
                    ))}
                  </Select>
                </>
              );
            })()}
            <span className={styles.tilde}>~</span>

            {/* 종료 */}
            <DatePicker
              value={form.endAt}
              onChange={(d) => setForm({ ...form, endAt: d })}
            />
            {(() => {
              const endHour = form.endAt ? form.endAt.hour() : 0;
              const endMinute = form.endAt ? form.endAt.minute() : 0;
              return (
                <>
                  <Select
                    value={endHour}
                    style={{ width: 70 }}
                    onChange={(h) =>
                      setForm({
                        ...form,
                        endAt: form.endAt.clone().hour(h),
                      })
                    }
                  >
                    {hours.map((h) => (
                      <Option key={h} value={h}>
                        {h.toString().padStart(2, "0")}시
                      </Option>
                    ))}
                  </Select>
                  <Select
                    value={endMinute}
                    style={{ width: 70 }}
                    onChange={(m) =>
                      setForm({
                        ...form,
                        endAt: form.endAt.clone().minute(m),
                      })
                    }
                  >
                    {minutes.map((m) => (
                      <Option key={m} value={m}>
                        {m.toString().padStart(2, "0")}분
                      </Option>
                    ))}
                  </Select>
                </>
              );
            })()}
          </div>
        </div>

        {/* 내용 */}
        <div className={styles.rowTopAlign}>
          <label>내용</label>
          <Input.TextArea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="내용을 입력하세요"
            style={{ width: 558, height: 80 }}
          />
        </div>

        {/* 장소 */}
        <div className={styles.row}>
          <label>장소</label>
          <Input
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            placeholder="장소를 입력하세요"
            style={{ width: 558 }}
            className={styles.hr}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleEditModal;
