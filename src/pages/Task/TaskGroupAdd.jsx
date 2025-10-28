import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { AutoComplete, Input, Pagination } from 'antd';
import styles from "./TaskGroupAdd.module.css";

// 업무 그룹 추가페이지
const TaskGroupAdd = ({ onClose }) => {
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");
    const [manager, setManager] = useState(null); // 객체 형태로 변경
    const [members, setMembers] = useState([]);
    const [searchOptions, setSearchOptions] = useState([]);
    const [managerOptions, setManagerOptions] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [managerSearchValue, setManagerSearchValue] = useState("");


    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // 전체 사원 목록 불러오기
    useEffect(() => {
        caxios.get("/member/list")
            .then(resp => setMembers(resp.data))
            .catch(err => console.error(err));
    }, []);

    // 관리자 자동완성
    const handleManagerSearch = (value) => {
        if (!value) {
            setManagerOptions([]);
            return;
        }

        const filtered = members
            .filter(m => m.name.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 10)
            .map(m => ({
                value: `${m.name}(${m.id}) (${m.dept_code} / ${m.rank_code})`, // ✅ 표시값을 "이름(아이디)"로
                label: (
                    <div>
                        <strong>{m.name}({m.id})</strong> ({m.dept_code} / {m.rank_code})
                    </div>
                ),
            }));

        setManagerOptions(filtered);
    };

    // 관리자 선택
    const handleManagerSelect = (value) => {
        // "이름(아이디)" 형태의 value에서 이름만 추출
        const idMatch = value.match(/\((.*?)\)/);
        const selected = idMatch ? members.find(m => m.id === idMatch[1]) : null;

        if (selected) {
            setManager(selected); // 관리자 객체 저장
            setManagerSearchValue(`${selected.name}(${selected.id})`); // 인풋에 표시

            // 선택된 관리자도 공유대상 테이블에 추가
            if (!selectedMembers.some(sm => sm.id === selected.id)) {
                setSelectedMembers(prev => [...prev, selected]);
            }
        }
    };

    // 공유대상 자동완성
    const handleSearch = (value) => {
        if (!value) {
            setSearchOptions([]);
            return;
        }

        const filtered = members
            .filter(m => m.name.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 10)
            .map(m => ({
                value: m.name,
                label: (
                    <div>
                        <strong>{m.name}({m.id})</strong> ({m.dept_code} / {m.rank_code})
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

        const managerId = managerSearchValue.slice(managerSearchValue.indexOf("(") + 1, managerSearchValue.indexOf(")")); // id추출
        if (id == managerId) {
            setManagerSearchValue("");
            setManager(null);
        }
    };
    useEffect(() => {
        const totalPages = Math.ceil(selectedMembers.length / pageSize);
        if (currentPage > totalPages) setCurrentPage(totalPages || 1);
    }, [selectedMembers]);
    
    // 그룹 생성
    const handleAdd = () => {
        if (groupName == null || groupName == "") {
            alert("그룹 이름을 입력해주세요.");
            return;
        }

        if (groupDesc == null || groupDesc == "") {
            alert("그룹 설명을 입력해주세요.");
            return;
        }

        if (!manager || !manager.id) {
            alert("관리자는 자동완성 목록에서 반드시 선택해주세요.");
            return;
        }
        if (selectedMembers.length === 0) {
            alert("공유 대상을 최소 1명 이상 선택해주세요.");
            return;
        }

        const payload = {
            group_name: groupName,
            description: groupDesc,
            manager_id: manager?.id || null,
            members: selectedMembers.map(m => m.id),
        };
        console.log("그룹 생성 요청:", payload);

        caxios.post("/task/addGroup", payload)
            .then(resp => {
                console.log("그룹 생성 완료:", resp.data);
                onClose();
            })
            .catch(err => console.error(err));

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
                        <AutoComplete
                            value={managerSearchValue}
                            options={managerOptions}
                            onSearch={handleManagerSearch}
                            onChange={(val) => setManagerSearchValue(val)} //  입력값 반영
                            onSelect={(value) => {
                                handleManagerSelect(value);
                            }}
                            placeholder="관리자 이름 검색"
                            style={{ width: "100%" }}
                        >
                            <Input disabled={!!manager} />
                        </AutoComplete>

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
                            onChange={(val) => setSearchValue(val)} //  입력값 반영
                            onSelect={(value) => {
                                handleSelect(value);
                                setSearchValue(""); //  선택 후 입력창 비우기
                            }}
                            placeholder="이름으로 검색"
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
                                <td>{m.rank_code}</td>
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
