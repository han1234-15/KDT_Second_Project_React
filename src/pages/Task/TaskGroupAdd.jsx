import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { AutoComplete, Input, Pagination } from 'antd';
import styles from "./TaskGroupAdd.module.css";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import { ranks } from '../../config/options.js';

// 업무 그룹 추가페이지
const TaskGroupAdd = ({ onClose }) => {
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");
    const [manager, setManager] = useState(null); // 객체 형태로 변경
    const [members, setMembers] = useState([]);
    const [searchOptions, setSearchOptions] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    // 전체 사원 목록 불러오기
    useEffect(() => {
        caxios.get("/member/list")
            .then(resp => setMembers(resp.data))
            .catch(err => console.error(err));

        caxios.get("/auth")
            .then(resp => setManager(resp.data))
            .catch(err => {
                logout();
                navigate("/");
                return;
            })
    }, []);

    // 공유대상 자동완성
    const handleSearch = (value) => {
        if (!value) {
            setSearchOptions([]);
            return;
        }

        const filtered = members
            .filter(m =>
                (m.name.toLowerCase().includes(value.toLowerCase()) ||
                    m.id.toLowerCase().includes(value.toLowerCase())) &&
                m.id != manager
            )
            .slice(0, 10)
            .map(m => ({
                value: m.name,
                label: (
                    <div>
                        <strong>{m.name}({m.id})</strong> ({m.dept_code} / {ranks[m.rank_code]})
                    </div>
                ),
            }));

        setSearchOptions(filtered);
    };

    // 공유대상 선택
    const handleSelect = (value) => {
        const selected = members.find(m => m.name === value);
        if (selected && !selectedMembers.some(sm => sm.id === selected.id)) {
            setSelectedMembers([...selectedMembers, selected]);
        }

        setSearchOptions([]);
    };

    // 공유대상 제거
    const handleRemove = (id) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== id));
    };
    useEffect(() => {
        const totalPages = Math.ceil(selectedMembers.length / pageSize);
        if (currentPage > totalPages) setCurrentPage(totalPages || 1);
    }, [selectedMembers]);

    // 그룹 생성
    const handleAdd = async () => {
        if (!groupName.trim()) {
            alert("그룹 이름을 입력해주세요.");
            return;
        }
        if (!groupDesc.trim()) {
            alert("그룹 설명을 입력해주세요.");
            return;
        }
        if (selectedMembers.length === 0) {
            alert("공유 대상을 최소 1명 이상 선택해주세요.");
            return;
        }

        const payload = {
            group_name: groupName,
            description: groupDesc,
            manager_id: manager,
            members: selectedMembers.map((m) => m.id),
        };

        console.log(selectedMembers);
        try {
            const resp = await caxios.post("/task/addGroup", payload);
            console.log("그룹 생성 완료:", resp.data);

            // ✅ 알림 전송
            await Promise.all(
                selectedMembers.map((m) => {
                    console.log(m.id)
                    caxios.post("/notification/send", {
                        receiver_id: m.id,
                        type: "taskgroup",
                        message: `[${groupName}] 업무 그룹에 초대되었습니다.`,
                    })
                }
                )
            );

            onClose();
        } catch (err) {
            console.error("❌ 그룹 생성 실패:", err);
        }
    };

    const handleOut = () => onClose();

    // 페이지 계산
    const startIndex = (currentPage - 1) * pageSize;
    const currentMembers = selectedMembers.slice(startIndex, startIndex + pageSize);

    return (
        <div className={styles.container}>
            <div className={styles.mainHeader}>
                <div style={{ marginLeft: "10px" }}>업무 그룹 만들기</div>
                <hr />
            </div>

            <div className={styles.mainBody}>
                {/* 그룹 이름 */}
                <div className={styles.mainBodybox}>
                    <div className={styles.NewSharedMailbox1}>그룹 이름</div>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className={styles.NewSharedMailbox2}
                    />
                </div>

                {/* 그룹 설명 */}
                <div className={styles.mainBodybox}>
                    <div className={styles.NewSharedMailbox1}>그룹 설명</div>
                    <input
                        type="text"
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                        className={styles.NewSharedMailbox2}
                    />
                </div>

                {/* 관리자 (자동완성) */}
                <div className={styles.mainBodybox}>
                    <div className={styles.NewSharedMailbox1}>관리자</div>

                    <div className={styles.managerWrapper}>
                        <Input disabled={true} value={manager} />
                    </div>
                </div>

                {/* 공유 대상 */}
                <div className={styles.mainBodybox}>
                    <div className={styles.NewSharedMailbox1}>공유 대상</div>
                    <div className={styles.managerWrapper}>
                        <AutoComplete
                            value={searchValue}
                            options={searchOptions}
                            onSearch={handleSearch}
                            onFocus={() => {                     // 클릭 시 전체 표시
                                const all = members
                                    .filter(m => m.id != manager)
                                    .slice(0, 10)
                                    .map(m => ({
                                        value: m.name,
                                        label: (
                                            <div>
                                                <strong>{m.name}({m.id})</strong> ({m.dept_code} / {ranks[m.rank_code]})
                                            </div>
                                        ),
                                    }));
                                setSearchOptions(all);
                            }}
                            onChange={(val) => setSearchValue(val)} //  입력값 반영
                            onSelect={(value) => {
                                handleSelect(value);
                                setSearchValue(""); //  선택 후 입력창 비우기
                            }}
                            placeholder="이름 혹은 ID로 검색"
                            style={{ width: "100%" }}
                        >
                            <Input />
                        </AutoComplete>
                    </div>
                </div>

                {/* 선택된 공유대상 목록 */}
                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th>이름(아이디)</th>
                            <th>부서</th>
                            <th>직급</th>
                            <th style={{ width: "100px" }}> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMembers.map((m) => (
                            <tr key={m.id}>
                                <td>{m.name}({m.id})</td>
                                <td>{m.dept_code}</td>
                                <td>{ranks[m.rank_code]}</td>
                                <td>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemove(m.id)}
                                    >
                                        취소
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 페이지네이션 */}
                {selectedMembers.length > pageSize && (
                    <div className={styles.paginationWrap}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={selectedMembers.length}
                            onChange={(page) => setCurrentPage(page)}
                            size="small"
                            showSizeChanger={false}
                        />
                    </div>
                )}

                {/* 하단 버튼 */}
                <div className={styles.footerButtons}>
                    <button className={styles.cancel} onClick={handleOut}>취소</button>
                    <button className={styles.create} onClick={handleAdd}>만들기</button>
                </div>
            </div>
        </div>
    );
};

export default TaskGroupAdd;
