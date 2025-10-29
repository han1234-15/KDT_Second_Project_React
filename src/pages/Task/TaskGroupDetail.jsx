import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Modal, Input, Select, Drawer, Table, AutoComplete, Button } from "antd";
import styles from "./TaskGroupDetail.module.css";
import { FaUser, FaCog } from "react-icons/fa";
import { caxios } from "../../config/config";

const { TextArea } = Input;

const TaskGroupDetail = () => {

  const { seq } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [membersCount, setMembersCount] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); // ✅ 멤버 모달 상태
  const [searchValue, setSearchValue] = useState("");
  const [allMembers, setAllMembers] = useState([]);

  // ✅ 업무 추가 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee_id: "",
    status: "대기",
  });

  // ✅ 상세 패널 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ✅ 서버 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await caxios.get(`/task/detail/${seq}`);

        // 백엔드 응답 구조가 아래 예시처럼 되어 있다고 가정
        // {
        //   group: { seq: 1, group_name: "Infinity 프로젝트" },
        //   membersCount: 3,
        //   members: [{ id: "kim", name: "김유정" }, ...],
        //   tasks: [{ seq: 1, title: "...", status: "...", ... }]
        // }
        console.log(resp);
        setGroup(resp.data.group);
        setTasks(resp.data.tasks || []);
        setMembersCount(resp.data.membersCount || 0);
        setMembers(resp.data.members || []);

        //멤버 리스트 가져오기용
        caxios
          .get("/member/list")
          .then((resp) => {
            setAllMembers(resp.data);
            console.log(resp);
          })
          .catch((err) => console.error("❌ 전체 멤버 조회 실패:", err));

      } catch (err) {
        console.error("❌ 그룹 상세 불러오기 실패:", err);
      }
    };

    fetchData();
  }, [seq]);

  // ✅ 더미 데이터
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
  //       {
  //         seq: 3,
  //         title: "요구사항 정리3",
  //         description: "고객 요청사항 분석 및 정리",
  //         assignee_id: "kim",
  //         status: "대기",
  //         created_at: "2025-10-28",
  //         comments: ["이거 이번주까지 완료해야 해요."],
  //       },
  //       {
  //         seq: 4,
  //         title: "요구사항 정리4",
  //         description: "고객 요청사항 분석 및 정리",
  //         assignee_id: "kim",
  //         status: "완료",
  //         created_at: "2025-10-28",
  //         comments: ["이거 이번주까지 완료해야 해요."],
  //       },
  //       {
  //         seq: 5,
  //         title: "요구사항 정리5",
  //         description: "고객 요청사항 분석 및 정리",
  //         assignee_id: "kim",
  //         status: "대기",
  //         created_at: "2025-10-28",
  //         comments: ["이거 이번주까지 완료해야 해요."],
  //       },
  //       {
  //         seq: 6,
  //         title: "UI 시안 검토6",
  //         description: "디자인 피드백 반영 필요",
  //         assignee_id: "lee",
  //         status: "진행중",
  //         created_at: "2025-10-29",
  //         comments: [],
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

  // ✅ 드래그핸들러
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const moved = grouped[sourceStatus][source.index];
    moved.status = destStatus;
    setTasks([...tasks]);
  };

  // ✅ 업무 클릭 → 상세 패널 열기
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  // ✅ 업무 추가
  const showModal = (status) => {
    setNewTask({ title: "", description: "", assignee_id: "", status });
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert("업무 제목을 입력해주세요.");
      return;
    }
    const newSeq = tasks.length ? Math.max(...tasks.map((t) => t.seq)) + 1 : 1;
    const added = { seq: newSeq, ...newTask, created_at: new Date().toLocaleDateString() };
    setTasks((prev) => [...prev, added]);
    setIsModalOpen(false);
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

      console.log("✅ 멤버 추가 완료:", resp.data);

      // 성공 후 members 상태 업데이트 (UI 반영)
      setMembers((prev) => [...prev, value]);
      setMembersCount((prevCount) => prevCount + 1);
    } catch (err) {
      console.error("❌ 멤버 추가 실패:", err);
      alert("멤버 추가 중 오류가 발생했습니다.");
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
          ><FaUser style={{ marginBottom: "3px" }} /> {membersCount}명 </span> <span><FaCog style={{ marginBottom: "3px", marginLeft: "10px" }} /> 그룹 제거</span>
        </div>
      </div>

      <div className={styles.dataInfo}>{tasks.length}개의 업무 데이터</div>

      <div className={styles.mainLayout}>
        {/* ✅ 왼쪽 칸반 */}
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
                                담당자: {task.assignee_id || "미지정"}
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

        {/* ✅ 오른쪽 상세 패널 */}
        <Drawer
          open={isDrawerOpen}
          width={400}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedTask?.title || "업무 상세"}
          placement="right"
        >
          {selectedTask && (
            <div className={styles.detailPanel}>
              <p><strong>상태:</strong> {selectedTask.status}</p>
              <p><strong>담당자:</strong> {selectedTask.assignee_id}</p>
              <p><strong>생성일:</strong> {selectedTask.created_at}</p>
              <p><strong>설명:</strong></p>
              <div className={styles.descriptionBox}>
                {selectedTask.description || "내용 없음"}
              </div>

              <hr />
              <div>
                <strong>💬 댓글</strong>
                <ul className={styles.commentList}>
                  {selectedTask.comments?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <Input.TextArea
                  rows={2}
                  placeholder="댓글을 입력하세요"
                  onPressEnter={(e) => {
                    const comment = e.target.value.trim();
                    if (comment) {
                      setSelectedTask({
                        ...selectedTask,
                        comments: [...(selectedTask.comments || []), comment],
                      });
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </Drawer>
      </div>

      {/* ✅ 업무 추가 모달 */}
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
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
              setNewTask({ ...newTask, description: e.target.value })
            }
            placeholder="업무 내용을 입력하세요."
          />
        </div>
      </Modal>

      {/* ✅ 멤버 목록 모달 */}
      <Modal
        title={`그룹 멤버 (${members.length}명)`}
        open={isMemberModalOpen}
        onCancel={() => setIsMemberModalOpen(false)}
        footer={null}
        width={650}
      >
        {/* 🔍 검색 영역 */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <AutoComplete
            style={{ flex: 1 }}
            placeholder="이름으로 멤버 추가"
            options={allMembers
              .filter((m) => m.name.toLowerCase().includes(searchValue?.toLowerCase?.() || ""))
              .map((m) => ({
                value: m.name,
                label: `${m.name} (${m.id})`,
              }))}
            onSearch={(val) => setSearchValue(val)}
            onSelect={(val) => {
              const found = allMembers.find((m) => m.name === val);
              if (found && !members.some((mem) => mem.id === found.id)) {
                memberSelect(found);
              }
              setSearchValue("");
            }}
            value={searchValue}
          />
        </div>

        {/* 📋 테이블 영역 */}
        <Table
          dataSource={members}
          rowKey="id"
          bordered
          pagination={false}
          size="middle"
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
            },
            {
              title: "직무",
              dataIndex: "job_code",
              key: "job_code",
              align: "center",
            },
            {
              title: "관리",
              key: "actions",
              align: "center",
              render: (_, record) => (
                <Button
                  type="link"
                  danger
                  onClick={() => setMembers(members.filter((m) => m.id !== record.id))}
                >
                  제거
                </Button>
              ),
            },
          ]}
        />
      </Modal>

    </div>
  );
};

export default TaskGroupDetail;
