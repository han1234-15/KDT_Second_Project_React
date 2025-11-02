import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Modal, Input, Select, Drawer, Table, AutoComplete, Button } from "antd";
import styles from "./TaskGroupDetail.module.css";
import { FaUser, FaCog } from "react-icons/fa";
import { caxios } from "../../config/config";
import { FaUserAlt } from "react-icons/fa";
import { ranks } from "../../config/options";

const { TextArea } = Input;


const TaskGroupDetail = () => {

  const { seq } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [membersCount, setMembersCount] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); //  멤버 모달 상태
  const [searchValue, setSearchValue] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [loginId, setLoginId] = useState("");
  const [commentText, setCommentText] = useState(""); //업무 상세 패널 댓글용 상태 변수

  //  업무 추가 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({

    title: "",
    description: "",
    assignee_id: "",
    status: "대기",
  });

  //  상세 패널 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 업무 수정 모달 상태 변수
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);


  // 업무 그룹 수정
  const [isGroupSettingOpen, setIsGroupSettingOpen] = useState(false);
  const [editGroup, setEditGroup] = useState({ group_name: "", description: "", manager_id: "" });

  //  서버 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await caxios.get(`/task/detail/${seq}`);

        console.log(resp);
        setGroup(resp.data.group);
        setTasks(resp.data.tasks || []);
        setMembersCount(resp.data.membersCount || 0);
        setMembers(resp.data.members || []);

        //  로그인id가 전송되지 않은 경우
        if (!resp.data.loginId) {
          navigate("/");
          return;
        }

        //  그룹 멤버가 아닌 경우
        const isMember = resp.data.members.some(
          (m) => m.id === resp.data.loginId
        );

        if (!isMember) {
          alert("이 그룹에 접근할 권한이 없습니다.");
          navigate("/");
          return;
        }

        setLoginId(resp.data.loginId);

        //멤버 리스트 가져오기용
        caxios
          .get("/member/list")
          .then((resp) => {
            setAllMembers(resp.data);
            console.log(resp);
          })
          .catch((err) => console.error(" 전체 멤버 조회 실패:", err));

      } catch (err) {
        console.error("그룹 상세 불러오기 실패:", err);
      }
    };

    fetchData();
  }, [seq]);


  //사이드바 열면 서버에서 코멘트 가져오기
  useEffect(() => {
    if (isDrawerOpen && selectedTask?.seq) {
      caxios.get(`/task/comment/${selectedTask.seq}`)
        .then(resp => {
          console.log(resp);
          setSelectedTask(prev => ({
            ...prev,
            comments: resp.data,
          }));
        })
        .catch(err => console.error("댓글 불러오기 실패:", err));
    }
  }, [isDrawerOpen, selectedTask?.seq]);


  const openEditModal = (task) => {
    setEditTask({ ...task }); // 선택한 업무 복사
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editTask.title.trim()) {
      alert("업무 제목을 입력해주세요.");
      return;
    }

    try {
      const resp = await caxios.put("/task/updateTask", editTask);

      if (resp.status === 200) {
        const updatedTask = resp.data; // ✅ 서버에서 최신 데이터 받기 (created_at, updated_at 포함)
        alert("업무가 수정되었습니다.");
        console.log("서버에서 받은 수정된 데이터:", updatedTask);

        // ✅ 전체 목록 반영
        setTasks((prev) =>
          prev.map((t) => (t.seq === updatedTask.seq ? updatedTask : t))
        );

        // ✅ 상세 패널에도 반영
        setSelectedTask(updatedTask);

        // 모달 닫기
        setIsEditModalOpen(false);
        setIsDrawerOpen(false);
      } else {
        alert("업무 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("업무 수정 실패:", err);
      alert("업무 수정 중 오류가 발생했습니다.");
    }
  };

  const taskDelete = async (task) => { //업무 삭제
    if (!window.confirm(`"${task.title}" 업무를 삭제하시겠습니까?`)) return;

    try {
      const resp = await caxios.delete("/task/deleteTask", { data: { seq: task.seq } });

      if (resp.status === 200) {
        alert("업무가 삭제되었습니다.");
        setTasks((prev) => prev.filter((t) => t.seq !== task.seq));
        setIsDrawerOpen(false); // 상세창 닫기
      } else {
        alert("업무 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("업무 삭제 실패:", err);
      alert("업무 삭제 중 오류가 발생했습니다.");
    }
  };
  //  더미 데이터
  // useEffect(() => {
  //   const mockData = {
  //     group: { seq: 1, group_name: "Infinity 프로젝트" },
  //     membersCount: 3,
  //     members: [
  //       { id: "kim", name: "김유정" },
  //       { id: "lee", name: "이준호" },
  //       { id: "park", name: "박서연" },
  //     ],
  //     tasks: [
  //       {
  //         seq: 1,
  //         title: "요구사항 정리1",
  //         description: "고객 요청사항 분석 및 정리",
  //         assignee_id: "kim",
  //         status: "대기",
  //         created_at: "2025-10-28",
  //         comments: ["이거 이번주까지 완료해야 해요."],
  //       },
  //       {
  //         seq: 2,
  //         title: "요구사항 정리2",
  //         description: "고객 요청사항 분석 및 정리",
  //         assignee_id: "kim",
  //         status: "대기",
  //         created_at: "2025-10-28",
  //         comments: ["이거 이번주까지 완료해야 해요."],
  //       },
  //     ],
  //   };

  //   setGroup(mockData.group);
  //   setTasks(mockData.tasks);
  //   setMembersCount(mockData.membersCount);
  //   setMembers(mockData.members);
  // }, [seq]);

  if (!group) return <div>로딩 중...</div>;

  const statuses = ["대기", "진행중", "완료"];
  const grouped = {};
  statuses.forEach((s) => (grouped[s] = tasks.filter((t) => t.status === s)));

  //  드래그핸들러
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const moved = grouped[sourceStatus][source.index];

    // UI 즉시 반영 (optimistic update)
    const optimistic = tasks.map((t) =>
      t.seq === moved.seq ? { ...t, status: destStatus } : t
    );
    setTasks(optimistic);

    try {
      const resp = await caxios.put("/task/updateStatus", {
        seq: moved.seq,
        status: destStatus,
      });

      if (resp.status === 200) {
        const updated = resp.data; // ✅ 서버에서 받은 최신 DTO (updated_at 포함)

        // ✅ 서버값으로 최종 반영
        setTasks((prev) =>
          prev.map((t) => (t.seq === updated.seq ? updated : t))
        );

        // ✅ 만약 이게 현재 열려 있는 상세창이라면 함께 반영
        setSelectedTask((prev) =>
          prev && prev.seq === updated.seq ? updated : prev
        );
      } else {
        throw new Error("서버 오류");
      }
    } catch (err) {
      console.error("상태 업데이트 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");

      // 실패 시 롤백
      window.location.reload();
    }
  };

  //  업무 클릭 → 상세 패널 열기
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  //  업무 추가
  const showModal = (status) => {
    setNewTask({ title: "", description: "", assignee_id: "", status });
    setIsModalOpen(true);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert("업무 제목을 입력해주세요.");
      return;
    }

    if (!newTask.assignee_id.trim()) {
      alert("담당자를 입력해주세요.");
      return;
    }

    try {
      const payload = {
        group_seq: seq,              // 현재 그룹 번호 (URL에서 가져옴)
        title: newTask.title,
        description: newTask.description,
        assignee_id: newTask.assignee_id,
        status: newTask.status,
        created_id: loginId,         // 현재 로그인한 사용자
      };



      setIsModalOpen(false);
      const resp = await caxios.post("/task/insertTask", payload);

      console.log(resp.data);
      if (resp.status === 200) {
        alert("업무가 등록되었습니다.");
        const newSeq = resp.data.seq;
        const newDate = resp.data.created_at;
        const added = { seq: newSeq, ...newTask, created_at: newDate };
        setTasks((prev) => [...prev, added]);
        setIsModalOpen(false);
      } else {
        alert("업무 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("업무 등록 실패:", err);
      alert("업무 등록 중 오류가 발생했습니다.");
    }
  };

  const memberSelect = async (value) => {
    try {
      console.log("선택된 멤버 ID:", value.id);

      // payload (보낼 데이터)
      const payload = {
        group_seq: seq,    // 현재 그룹 번호 (useParams에서 가져온)
        member_id: value.id, // 선택한 멤버 아이디
      };

      // 서버로 전송
      const resp = await caxios.post("/task/addMember", payload);

      console.log(" 멤버 추가 완료:", resp.data);

      // 성공 후 members 상태 업데이트 (UI 반영)
      setMembers((prev) => [...prev, value]);
      setMembersCount((prevCount) => prevCount + 1);
    } catch (err) {
      console.error(" 멤버 추가 실패:", err);
      alert("멤버 추가 중 오류가 발생했습니다.");
    }
  };

  const memberDelete = async (value) => {
    try {

      // payload (보낼 데이터)
      const payload = {
        group_seq: seq,      // 현재 그룹 번호
        member_id: value.id, // 삭제할 멤버 ID
      };


      // 서버로 전송
      const resp = await caxios.delete("/task/delMember", { data: payload });

      console.log("멤버 삭제 성공:", resp.data);

      // 상태 업데이트
      setMembers(members.filter((m) => m.id !== value.id));
      setMembersCount((prev) => prev - 1);
    } catch (err) {
      console.error("멤버 삭제 실패:", err);
      alert("멤버 삭제 중 오류가 발생했습니다.");
    }
  }

  const groupDelete = async () => {
    try {
      // 확인 창 띄우기
      const isManager = group.manager_id === loginId;
      const confirmMsg = isManager
        ? "정말 이 그룹을 완전히 삭제하시겠습니까?\n(모든 멤버와 업무가 함께 삭제됩니다.)"
        : "정말 이 그룹에서 나가시겠습니까?";

      // 사용자가 취소 누르면 종료
      if (!window.confirm(confirmMsg)) return;

      // payload (보낼 데이터)
      const payload = {
        group_seq: seq, // 현재 그룹 번호
      };

      // 서버로 전송
      const resp = await caxios.delete("/task/delGroup", { data: payload });

      if (resp.status === 200) {
        alert(isManager ? "그룹이 삭제되었습니다." : "그룹에서 나갔습니다.");
        navigate("/task/group");
      } else {
        alert("요청 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("그룹 삭제 실패:", err);
      alert("그룹 삭제 중 오류가 발생했습니다.");
    }
  };


  // ✅ 댓글 등록 함수 (등록 + 최신 목록 갱신)
  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text) return;

    const newComment = {
      writer_name: members.find(m => m.id === loginId)?.name || "익명",
      writer_id: loginId,
      content: text,
      created_at: new Date(),
    };

    // ✅ 1) 먼저 UI에 즉시 반영 (Optimistic)
    setSelectedTask((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));
    setCommentText("");

    try {
      // ✅ 2) 서버에 저장 요청
      await caxios.post("/task/comment", {
        task_seq: selectedTask.seq,
        content: text,
      });

      console.log("댓글 등록 성공");

      // ✅ 3) 최신 댓글 목록 다시 불러오기
      const resp = await caxios.get(`/task/comment/${selectedTask.seq}`);
      setSelectedTask((prev) => ({
        ...prev,
        comments: resp.data,
      }));
    } catch (err) {
      console.error("댓글 등록 실패:", err);
      alert("댓글 등록 중 오류가 발생했습니다.");

      // ✅ 4) 실패 시 UI 롤백
      setSelectedTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c !== newComment),
      }));
    }
  };

  // ✅ 댓글 삭제 함수
  const handleDeleteComment = async (commentSeq) => {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;

    try {
      await caxios.delete(`/task/comment/${commentSeq}`);
      console.log("댓글 삭제 성공");

      // ✅ 삭제 후 최신 댓글 목록 다시 불러오기
      const resp = await caxios.get(`/task/comment/${selectedTask.seq}`);
      setSelectedTask((prev) => ({
        ...prev,
        comments: resp.data,
      }));
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>←</button>
        <h2 className={styles.title}>업무 관리</h2>
      </div>

      <div className={styles.groupInfo}>
        <div className={styles.groupTitle}>📁 {group.group_name}</div>
        <div className={styles.groupMeta}>
          <span
            onClick={() => setIsMemberModalOpen(true)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
          ><FaUser style={{ fontSize: "16px", marginBottom: "0px" }} /> {membersCount}명 </span>

          {(loginId == group.manager_id) ?
            <button
              className={styles.groupDelBtn}
              onClick={() => {
                setEditGroup({ group_name: group.group_name, description: group.description, manager_id: group.manager_id });
                setIsGroupSettingOpen(true);
              }}
            >
              <FaCog style={{ fontSize: "17px", marginBottom: "3px", marginLeft: "10px", marginRight: "3px" }} /> 그룹 설정
            </button>
            :
            <button className={styles.groupDelBtn} onClick={() => groupDelete()}><FaCog style={{ marginBottom: "3px", marginLeft: "10px" }} /> 그룹 나가기</button>
          }
        </div>
      </div>
      <div style={{ padding: "10px", width: "40%" }}>
        {group.description}
      </div>
      <div className={styles.dataInfo}>{tasks.length}개의 업무 데이터</div>


      {/*  왼쪽 칸반 */}
      <div className={styles.mainLayout}>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={styles.kanbanWrapper}>
            {statuses.map((status) => (
              <div className={styles.column} key={status}>
                <div className={styles.columnHeader}>
                  {status} <span>{grouped[status].length}</span>
                </div>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={styles.taskList}
                    >
                      {grouped[status].map((task, index) => (
                        <Draggable
                          key={task.seq.toString()}
                          draggableId={task.seq.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={styles.taskCard}
                              onClick={() => handleTaskClick(task)}
                            >
                              <div className={styles.taskTitle}>{task.title}</div>
                              <div className={styles.taskAssignee}>
                                담당자: {
                                  task.assignee_id
                                    ? (() => {
                                      // allMembers 전체에서 해당 사용자 찾기
                                      const foundMember = allMembers.find(m => m.id === task.assignee_id);
                                      // 그룹 멤버 목록에 포함되는지 여부 확인
                                      const isStillMember = members.some(m => m.id === task.assignee_id);

                                      // 이름 표시 + 그룹 탈퇴 여부 표시
                                      return foundMember
                                        ? `${foundMember.name}${!isStillMember ? " (그룹 탈퇴 멤버)" : ""}`
                                        : `${task.assignee_id} (탈퇴 유저)`;
                                    })()
                                    : "미지정"
                                }
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button className={styles.addBtn} onClick={() => showModal(status)}>
                  + 업무 추가
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/*  오른쪽 상세 패널 */}
        <Drawer
          open={isDrawerOpen}
          width={500}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedTask?.title || "업무 상세"}
          placement="right"
        >
          {selectedTask && (
            <div className={styles.detailPanel}>
              <p><strong>상태:</strong> {selectedTask.status}</p>
              <p>
                <strong>담당자:</strong>{" "}
                {(() => {
                  if (!selectedTask.assignee_id) return "미지정";

                  // 전체 회원 중 해당 아이디 찾기
                  const assignee = allMembers.find(m => m.id === selectedTask.assignee_id);
                  // 현재 그룹 멤버에 포함되어 있는지 확인
                  const isStillMember = members.some(m => m.id === selectedTask.assignee_id);

                  // 조건 분기
                  if (assignee) {
                    return `${assignee.name} (${assignee.id})${!isStillMember ? " (그룹 탈퇴 유저)" : ""}`;
                  } else {
                    return `${selectedTask.assignee_id} (탈퇴 유저)`;
                  }
                })()}
              </p>
              <p><strong>생성일:</strong> {selectedTask.created_at}</p>
              <p><strong>수정일:</strong> {selectedTask.updated_at}</p>
              <p><strong>설명:</strong></p>
              <div className={styles.descriptionBox}>
                {selectedTask.description || "내용 없음"}
              </div>
              <div>
                <button
                  className={styles.rightBtn}
                  onClick={() => openEditModal(selectedTask)}
                >
                  수정
                </button>
                <button
                  className={styles.rightBtn}
                  onClick={() => taskDelete(selectedTask)}
                >
                  제거
                </button>
              </div>
              <hr />
              {/* 💬 댓글 영역 */}
              <div>
                <strong>💬 댓글</strong>
                <ul className={styles.commentList}>
                  {selectedTask.comments?.map((c, i) => (
                    <li key={i} className={styles.commentItem}>
                      <div className={styles.commentRow}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentName}>
                            <FaUserAlt style={{ margin: "5px 5px 8px 5px" }} />{c.writer_name} ({c.writer_id})
                          </span>
                          <span className={styles.commentTime}>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "방금 전"}
                          </span>

                          {/* 삭제 버튼 (오른쪽 끝 고정) */}
                          <button className={styles.commentDeleteBtn} onClick={() => handleDeleteComment(c.seq)}>x</button>
                        </div>

                        <div className={styles.commentContent}>{c.content}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <Input
                  style={{ width: "97%" }}  // ← 원하는 %나 px 단위로 지정
                  placeholder="댓글을 입력하세요."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    handleAddComment();
                  }}
                />
              </div>
            </div>
          )}
        </Drawer>
      </div>

      {/*  업무 추가 모달 */}
      <Modal
        open={isModalOpen}
        title="새 업무 추가"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddTask}
        okText="등록"
        cancelText="취소"
        width={400}
      >
        <div className={styles.modalContent}>
          <label>업무 제목</label>
          <Input
            value={newTask.title}
            onChange={(e) =>
              setNewTask(prev => ({
                ...prev,
                title: e.target.value
              }))
            }
          />
          <label style={{ marginTop: "10px" }}>담당자</label>
          <Select
            value={newTask.assignee_id}
            onChange={(val) => setNewTask({ ...newTask, assignee_id: val })}
            style={{ width: "100%" }}
            placeholder="담당자 선택"
            options={members.map((m) => ({
              value: m.id,
              label: `${m.name} (${m.id})`,
            }))}
          />
          <label style={{ marginTop: "10px" }}>업무 설명</label>
          <TextArea
            rows={3}
            value={newTask.description}
            onChange={(e) =>
              setNewTask(prev => ({
                ...prev,
                description: e.target.value
              }))
            }
            placeholder="업무 내용을 입력하세요."
          />
        </div>
      </Modal>

      {/*  멤버 목록 모달 */}
      <Modal
        title={`그룹 멤버 (${members.length}명)`}
        open={isMemberModalOpen}
        onCancel={() => setIsMemberModalOpen(false)}
        footer={null}
        width={650}
        modalRender={(modal) => (
          <div style={{ marginTop: '20%' }}>
            {modal}
          </div>
        )}
      >
        {/* 검색 영역 */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <AutoComplete
            style={{ flex: 1 }}
            placeholder="이름 또는 ID로 멤버 추가"
            options={allMembers
              .filter((m) => {
                const keyword = (searchValue || "").toLowerCase();
                return (
                  m.name.toLowerCase().includes(keyword) ||
                  m.id.toLowerCase().includes(keyword) // ID 포함 검색
                );
              })
              // 이미 그룹에 포함된 멤버 제외
              .filter((m) => !members.some((mem) => mem.id === m.id))
              .map((m) => ({
                value: `${m.name} (${m.id})`, // 표시도 이름 + ID
                label: `${m.name} (${m.id})`,
              }))}
            onSearch={(val) => setSearchValue(val)}
            onSelect={(val) => {
              //  선택 시 id 추출
              const idMatch = val.match(/\(([^)]+)\)$/);
              const selectedId = idMatch ? idMatch[1] : null;

              const found = allMembers.find((m) => m.id === selectedId);
              if (found && !members.some((mem) => mem.id === found.id)) {
                memberSelect(found);
              }
              setSearchValue("");
            }}
            value={searchValue}
          />
        </div>

        {/*  테이블 영역 */}
        <Table
          dataSource={members}
          tableLayout="fixed"
          rowKey="id"
          bordered
          size="middle"
          pagination={{
            pageSize: 10, //  한 페이지에 표시할 행 개수

          }}
          columns={[
            {
              title: "이름 (ID)",
              dataIndex: "name",
              key: "name",
              render: (text, record) => `${record.name} (${record.id})`,
            },
            {
              title: "부서",
              dataIndex: "dept_code",
              key: "dept_code",
              align: "center",
            },
            {
              title: "직급",
              dataIndex: "rank_code",
              key: "rank_code",
              align: "center",
              render: (code) => ranks[code] || code
            }
            ,
            {
              title: "직무",
              dataIndex: "job_code",
              key: "job_code",
              align: "center",
            },
            {
              title: "비고",
              key: "actions",
              align: "center",
              render: (_, record) => {
                if (record.id === group.manager_id) {
                  return <span style={{ color: "#aaa" }}>관리자</span>;
                }

                if (loginId === group.manager_id) {
                  return (
                    <button
                      style={{
                        color: "#ff0000",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => memberDelete(record)}
                    >
                      제거
                    </button>
                  );
                }

                return null;
              },
            },
          ]}
        />

      </Modal>
      <Modal
        open={isEditModalOpen}
        title="업무 수정"
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdateTask}
        okText="수정"
        cancelText="취소"
        width={400}
      >
        <div className={styles.modalContent}>
          <label>업무 제목</label>
          <Input
            value={editTask?.title || ""}
            onChange={(e) =>
              setEditTask((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <label style={{ marginTop: "10px" }}>담당자</label>
          <Select
            value={editTask?.assignee_id || ""}
            onChange={(val) => setEditTask((prev) => ({ ...prev, assignee_id: val }))}
            style={{ width: "100%" }}
            placeholder="담당자 선택"
            options={members.map((m) => ({
              value: m.id,
              label: `${m.name} (${m.id})`,
            }))}
          />
          <label style={{ marginTop: "10px" }}>상태</label>
          <Select
            value={editTask?.status || ""}
            onChange={(val) => setEditTask((prev) => ({ ...prev, status: val }))}
            style={{ width: "100%" }}
            placeholder="상태 선택"
            options={statuses.map((m) => ({
              value: m,
              label: m,
            }))}
          />
          <label style={{ marginTop: "10px" }}>업무 설명</label>
          <TextArea
            rows={3}
            value={editTask?.description || ""}
            onChange={(e) =>
              setEditTask((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="업무 내용을 입력하세요."
          />
        </div>
      </Modal>

      {/* 업무 그룹 설정 모달 */}
      <Modal
        open={isGroupSettingOpen}
        title="그룹 설정"
        onCancel={() => setIsGroupSettingOpen(false)}
        onOk={async () => {
          try {
            const resp = await caxios.put("/task/updateGroup", {
              seq,
              group_name: editGroup.group_name,
              description: editGroup.description,
              manager_id: editGroup.manager_id, // ✅ 매니저 변경 추가
            });

            if (resp.status === 200) {
              alert("그룹 정보가 수정되었습니다.");
              setGroup(prev => ({
                ...prev,
                group_name: editGroup.group_name,
                description: editGroup.description,
                manager_id: editGroup.manager_id,
              }));
              setIsGroupSettingOpen(false);
            }
          } catch (err) {
            console.error("그룹 수정 실패:", err);
            alert("그룹 수정 중 오류가 발생했습니다.");
          }
        }}
        okText="저장"
        cancelText="취소"
        width={450}
      >
        <div className={styles.modalContent}>
          <label>그룹명</label>
          <Input
            value={editGroup.group_name}
            onChange={(e) => setEditGroup(prev => ({ ...prev, group_name: e.target.value }))}
          />

          <label style={{ marginTop: "10px" }}>그룹 설명</label>
          <TextArea
            rows={3}
            style={{ resize: "none" }}   // ✅ 사이즈 조절 비활성화
            value={editGroup.description}
            onChange={(e) => setEditGroup(prev => ({ ...prev, description: e.target.value }))}
            placeholder="그룹 설명을 입력하세요."
            resi
          />

          <label style={{ marginTop: "10px", display: "block" }}>매니저 위임</label>
          <Select
            style={{ width: "75%" }}
            value={editGroup.manager_id || group.manager_id}
            onChange={(val) => setEditGroup(prev => ({ ...prev, manager_id: val }))}
            options={members.map(m => ({
              value: m.id,
              label: `${m.name} (${m.id})`,
            }))}
          />
          <button
            onClick={() => {
              if (window.confirm("정말 그룹을 삭제하시겠습니까?\n모든 업무와 멤버 데이터가 삭제됩니다.")) {
                groupDelete();
                setIsGroupSettingOpen(false);
              }
            }}
            style={{
              backgroundColor: "#ff4d4f",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "13px",
              marginLeft: "6%",
              height: "31.2px"
            }}
          >
            그룹 제거
          </button>
          <div
            style={{
              borderTop: "1px solid #eee",
              marginTop: "20px",
              paddingTop: "15px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >

          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskGroupDetail;
