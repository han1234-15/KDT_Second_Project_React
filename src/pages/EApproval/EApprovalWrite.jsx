import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/ApprovalWrite.css";
import approveImg from "./images/승인.jpg";
import rejectImg from "./images/반려.png";
import { caxios } from "../../config/config";

function EApprovalWrite() {
  const [showModal,setShowModal]=useState(false);
  const [approvalResult,setApprovalResult]=useState(null);

  const navigate = useNavigate();

  // 문서 종류별 양식 옵션
  const templateOptions = {
    공통: ["업무연락", "품의서", "회의록"],
  };

  // 입력 상태
  const [formData, setFormData] = useState({
    docType: "",
    template: "",
    writer: "하이웍스산업 대표이사",
    retention: "5년",
    security: "C등급",
    title: "",
    comments: "",
  });

  // 결재 관련
  const [approvers, setApprovers] = useState(["대표이사"]);

  // 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "docType") {
      setFormData({ ...formData, [name]: value, template: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addApprover = () => {
    const name = prompt("결재자 이름을 입력하세요:");
    if (name) setApprovers([...approvers, name]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    caxios
      .post(`/Eapproval/write`, formData)
      .then(() => {
        alert("결재 문서가 성공적으로 등록되었습니다 ");
        navigate("/Eapproval/A");
      })
      .catch(() => alert("등록 중 오류 발생 "));
  };

  const handleTempSave =()=>{
    const data={...formData,status:"temp"}
     axios.post("http://10.5.5.11/Eapproval/tempSave", data)
     .then(()=>{
        alert("임시 저장 완료")
        navigate("/Eapproval/A")
     })
     .catch(()=>alert("임시 저장 실패"));
  };

  const handleApprovlClick=()=>setShowModal(true);

  
  const handleApprovalDecision=(result)=>{

    const newStatus=result==="approve" ?"in_progress":" rejected";

    axios.put(`http://10.5.5.11/Eapproval/updateStatus/${formData.seq}?status=${newStatus}`)
    .then(()=>{
      alert(
        result === "approve" ?"결재 승인":"결재 반려"
      );
      setApprovalResult(result);
      setShowModal(false);
    })
    .catch(()=>{
      alert("망했어")
      setShowModal(false);
    })
   
    
  }

  // 문서 선택 여부
  const isDocSelected = formData.docType && formData.template;

  return (
    <div className="approval-write-container">
   

      {/* 기본 설정 */}
      <h3 className="section-title">기본 설정</h3>
      <table className="base-table">
        <tbody>
          <tr>
            <th>문서 종류</th>
            <td>
              <select
                name="docType"
                value={formData.docType}
                onChange={handleChange}
              >
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
          <tr>
            <th>보존 연한</th>
            <td>
              <select
                name="retention"
                value={formData.retention}
                onChange={handleChange}
              >
                <option value="1년">1년</option>
                <option value="3년">3년</option>
                <option value="5년">5년</option>
              </select>
            </td>
            <th>보안 등급</th>
            <td>
              <select
                name="security"
                value={formData.security}
                onChange={handleChange}
              >
                <option value="A등급">A등급</option>
                <option value="B등급">B등급</option>
                <option value="C등급">C등급</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 문서 선택 전 안내 */}
      {!isDocSelected && (
        <div className="notice-box">
          ✏️ 문서 종류와 양식을 선택하면 결재선 및 작성 영역이 표시됩니다.
        </div>
      )}

      {/* 문서 종류 선택 후 표시되는 영역 */}
      {isDocSelected && (
        <>
          {/* 결재선 설정 */}
          <h3 className="section-title">결재선 설정</h3>
          <div className="approval-line-table">
            <table>
              <thead>
                <tr>
                  <th className="head-cell">
                    <button onClick={addApprover}>＋</button>
                  </th>
                  {approvers.map((a, i) => (
                    <th key={i}>{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label">결재</td>
                  {approvers.map((a, i) => (
                    <td key={i} className="empty">
                      {a ==="대표이사" &&(
                        <>
                        {!approvalResult &&(
                        <button className="approve-btn" onClick={handleApprovlClick}>
                          결재
                        </button>
                        )}

                        {approvalResult ==="approve" &&(
                          <img src={approveImg} alt="승인" className="stamp"></img>
                        )}
                        {approvalResult ==="reject" &&(
                          <img src={rejectImg} alt="반려" className="stamp"></img>
                        )}
                        </>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="label">참조</td>
                  <td colSpan={approvers.length}>
                    <input placeholder="클릭 후 입력" />
                  </td>
                </tr>
                <tr>
                  <td className="label">수신</td>
                  <td colSpan={approvers.length}>
                    <input placeholder="클릭 후 입력" />
                  </td>
                </tr>
                <tr>
                  <td className="label">(수신)참조</td>
                  <td colSpan={approvers.length}>
                    <input placeholder="클릭 후 입력" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        {/* === 모달 === */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h4>결재 처리</h4>
                <p>결재를 승인하시겠습니까, 반려하시겠습니까?</p>
                <div className="modal-buttons">
                  <button
                    className="approve"
                    onClick={() => handleApprovalDecision("approve")}
                  >
                    승인
                  </button>
                  <button
                    className="reject"
                    onClick={() => handleApprovalDecision("reject")}
                  >
                    반려
                  </button>
                  <button
                    className="cancel"
                    onClick={() => setShowModal(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 제목 */}
          <div className="input-block">
            <label>제목</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력해 주세요."
            />
          </div>

          {/* 본문 */}
          <div className="input-block">
            <label>본문</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="10"
              placeholder="내용을 입력해 주세요."
            ></textarea>
          </div>

          {/* 하단 버튼 */}
          <div className="bottom-buttons">
            <button
              className="cancel"
              onClick={() => navigate("/Eapproval/A")}
            >
              취소
            </button>
            <button onclassName="temp" onClick={handleTempSave}>
                임시저장
            </button>
            <button className="submit" onClick={handleSubmit}>
              결재 상신
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default EApprovalWrite;
