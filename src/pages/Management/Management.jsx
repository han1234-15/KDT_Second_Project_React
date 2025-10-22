import style from './Management.module.css'
import { Link } from 'react-router-dom';

import { AuditOutlined, ClusterOutlined, DownOutlined, FileDoneOutlined, ProfileOutlined, RestOutlined, UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Dropdown, Input, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { Button, Flex, Table, Modal } from 'antd';
import { caxios } from '../../config/config';
import { departmentOptions } from '../../config/options';
import { jobOptions } from '../../config/options';
import { positionOptions } from '../../config/options';
import { AiOutlineSearch } from "react-icons/ai";


import dayjs from "dayjs";

const Management = () => {

    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState(0); //그룹웨어 사용 인원
    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] = useState('근로 형태');
    const [deptFilter, setDeptFilter] = useState('전체 부서');
    const [jobFilter, setJobFilter] = useState('전체 직무');
    const [rankFilter, setRankFilter] = useState('전체 직위');
    const [employmentFilter, setEmploymentFilter] = useState('재직 상태');

    // 모달용 상태 추가
    const [openModal, setOpenModal] = useState(null);
    // null | 'delete' | 'empType' | 'dept' | 'rank' | 'job'
    const [empTypeValue, setEmpTypeValue] = useState(null); // 근로형태
    const [deptValue, setDeptValue] = useState(null);       // 부서
    const [rankValue, setRankValue] = useState(null);       // 직위
    const [jobValue, setJobValue] = useState(null);         // 직무
    const [statusValue, setStatusValue] = useState(null);         // 재직상태


    useEffect(() => {
        caxios.get('/member') // 서버에서 사용자 리스트 API
            .then(resp => {
                setUsers(resp.data); // 서버에서 JSON 배열로 받는다고 가정
                setUserCount(resp.data.length);
            })
            .catch(err => {
                console.error('사용자 목록 가져오기 실패', err);
            });
    }, []);

    const headItems1 = [
        { value: '근로 형태', label: '근로 형태' },
        { value: '일반직', label: '일반직' },
        { value: '임원,촉탁', label: '임원,촉탁' },
    ];

    const headItems2 = [
        { value: '전체 부서', label: '전체 부서' },  // "전체"를 맨 앞에
        ...departmentOptions
    ];

    const headItems3 = [
        { value: '전체 직위', label: '전체 직위' },
        ...positionOptions
    ];

    const headItems4 = [
        { value: '전체 직무', label: '전체 직무' },
        ...jobOptions
    ];

    const headItems5 = [
        { value: '재직 상태', label: '재직 상태' },
        { value: '재직자', label: '재직자' },
        { value: '퇴사자', label: '퇴사자' },
    ];

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        fetchUsers({ status: value, dept: deptFilter, employment: employmentFilter, job: jobFilter, rank: rankFilter });
    };

    const handleDeptChange = (value) => {
        setDeptFilter(value);
        fetchUsers({ status: statusFilter, dept: value, employment: employmentFilter, job: jobFilter, rank: rankFilter });
    };

    const handleEmploymentChange = (value) => {
        setEmploymentFilter(value);
        fetchUsers({ status: statusFilter, dept: deptFilter, employment: value, job: jobFilter, rank: rankFilter });
    };

    const handleJobChange = (value) => {
        setJobFilter(value);
        fetchUsers({ status: statusFilter, dept: deptFilter, employment: employmentFilter, job: value, rank: rankFilter });
    };

    const handleRankChange = (value) => {
        setRankFilter(value);
        fetchUsers({ status: statusFilter, dept: deptFilter, employment: employmentFilter, job: jobFilter, rank: value });
    };
    // 공통 fetchUsers 함수
    const fetchUsers = (filter = {}) => {
        let url = '/member';
        const params = new URLSearchParams();

        if (filter.status && filter.status !== '근로 형태') params.append('status', filter.status);
        if (filter.dept && filter.dept !== '전체 부서') params.append('dept', filter.dept);
        if (filter.employment && filter.employment !== '전체 직위') params.append('employment', filter.employment);
        if (filter.job && filter.job !== '전체 직무') params.append('job', filter.job);
        if (filter.rank && filter.rank !== '재직 상태') params.append('rank', filter.rank);

        const queryStr = params.toString();
        if (queryStr) url += `?${queryStr}`;

        caxios.get(url)
            .then(resp => {
                setUsers(resp.data);
                setSelectedRowKeys([]);
            })
            .catch(err => console.error('목록 불러오기 실패', err));
    };


    const columns = [
        { title: '이름', dataIndex: 'name', key: 'name' },
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: '사번', dataIndex: 'employee_no', key: 'employee_no' },
        { title: '근로 형태', dataIndex: 'employmentType', key: 'employmentType' },
        { title: '부서', dataIndex: 'dept_code', key: 'dept_code' },
        { title: '직위', dataIndex: 'rank_code', key: 'rank_code' },
        { title: '직무', dataIndex: 'job_code', key: 'job_code' },
        { title: '입사일', dataIndex: 'hire_date', key: 'hire_date', render: (text) => text ? dayjs(text).format("YYYY-MM-DD") : "" },
        { title: '재직 상태', dataIndex: 'status', key: 'status' },
    ];

    const filteredUsers = users
        .filter(user =>
            user.name.includes(search) ||
            user.id.includes(search) ||
            user.employee_no.includes(search)
        )
        .map(user => ({ ...user, key: user.id })); // key 추가

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const onSelectChange = newSelectedRowKeys => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const handlePageChange = () => {
        // 1. 페이지가 변경될 때 선택된 행(selectedRowKeys)을 초기화
        setSelectedRowKeys([]);

    };

    const handleClick = (e) => {
        const { name } = e.currentTarget;
        setOpenModal(name); // 체크박스 클릭했을 때 나오는 버튼 중 어떤 버튼 눌렀는지 저장
    };

    const closeModal = () => {
        if (openModal === 'empType') setEmpTypeValue(null);
        if (openModal === 'dept') setDeptValue(null);
        if (openModal === 'rank') setRankValue(null);
        if (openModal === 'job') setJobValue(null);
        if (openModal === 'status') setStatusValue(null);
        setOpenModal(null);
    }

    // 삭제 요청
    const deleteUsers = async (userIds) => {
        try {
            await caxios.delete('/member', { data: userIds });
            fetchUsers(); // 삭제 후 테이블 갱신
            setSelectedRowKeys([]); // 선택 초기화
            closeModal();
        } catch (err) {
            console.error('삭제 실패', err);
            alert('삭제 실패');
        }
    };

    // 근로형태 수정
    const updateEmpType = async (value) => {

        if (value == null) {
            alert("근로 형태를 선택해주세요");
            return;
        }

        try {
            await caxios.put('/member/empType', {
                ids: selectedRowKeys,
                empType: value
            });
            fetchUsers();
            setSelectedRowKeys([]); // 선택 초기화
            closeModal();
        } catch (err) {
            console.error('수정 실패', err);
            alert('수정 실패');
        }
    };

    const updateDept = async (value) => {

        if (value == null) {
            alert("부서를 선택해주세요");
            return;
        }

        try {
            await caxios.put('/member/dept', {
                ids: selectedRowKeys,
                dept: value
            });
            fetchUsers();
            setSelectedRowKeys([]); // 선택 초기화
            closeModal();
        } catch (err) {
            console.error('수정 실패', err);
            alert('수정 실패');
        }
    };

    const updateRank = async (value) => {
        if (value == null) {
            alert("직위를 선택해주세요");
            return;
        }
        try {
            await caxios.put('/member/rank', {
                ids: selectedRowKeys,
                rank: value
            });
            fetchUsers();
            setSelectedRowKeys([]); // 선택 초기화
            closeModal();
        } catch (err) {
            console.error('수정 실패', err);
            alert('수정 실패');
        }
    };

    const updateJob = async (value) => {
        if (value == null) {
            alert("직무를 선택해주세요");
            return;
        }
        try {
            await caxios.put('/member/job', {
                ids: selectedRowKeys,
                job: value
            });
            fetchUsers();
            setSelectedRowKeys([]); // 선택 초기화
            closeModal();
        } catch (err) {
            console.error('수정 실패', err);
            alert('수정 실패');
        }
    };

    const updateStatus = async (value) => {
        if (value == null) {
            alert("재직 상태를 선택해주세요");
            return;
        }
        try {
            await caxios.put('/member/status', {
                ids: selectedRowKeys,
                status: value
            });
            fetchUsers();
            setSelectedRowKeys([]); // 선택 초기화
            closeModal();
        } catch (err) {
            console.error('수정 실패', err);
            alert('수정 실패');
        }
    };



    return (
        <div className={style.container}>

            <div className='body'>
                <h4>
                    사용자 현황 {userCount}명
                </h4>
                <div className={style.userManageBtn}>

                    <Link to="/management/register" className={style.buttonLink}>사용자 등록</Link>
                    <Link to="/" className={style.buttonLink}>비활성 사용자</Link>
                </div>

                <div >
                    <Flex gap="middle" vertical>
                        <Flex align="center" gap="middle">
                            {hasSelected ?
                                <div className={style.tableHead}>
                                    <span style={{ marginRight: '10px' }}><UserOutlined /> {selectedRowKeys.length}명</span>
                                    <button name="delete" onClick={handleClick}><RestOutlined /> 삭제</button>
                                    <button name="empType" onClick={handleClick}><UserSwitchOutlined /> 근로형태 수정</button>
                                    <button name="dept" onClick={handleClick}><ClusterOutlined /> 부서 수정</button>
                                    <button name="rank" onClick={handleClick}><AuditOutlined /> 직위 수정</button>
                                    <button name="job" onClick={handleClick}><FileDoneOutlined /> 직무 수정</button>
                                    <button name="status" onClick={handleClick}><FileDoneOutlined /> 재직상태 수정</button>
                                </div>
                                :
                                <div style={{ width: '80%' }}>
                                    <Select
                                        defaultValue="근로 형태"
                                        variant="borderless"
                                        style={{ width: 100 }}
                                        onChange={handleEmploymentChange}
                                        options={headItems1}
                                        className={style.select}
                                    />

                                    <Select
                                        defaultValue="전체 부서"
                                        variant="borderless"
                                        style={{ width: 110 }}
                                        onChange={handleDeptChange}
                                        options={headItems2}
                                    />

                                    <Select
                                        defaultValue="전체 직위"
                                        variant="borderless"
                                        style={{ width: 110 }}
                                        onChange={handleRankChange}
                                        options={headItems3}
                                    />

                                    <Select
                                        defaultValue="전체 직무"
                                        variant="borderless"
                                        style={{ width: 110 }}
                                        onChange={handleJobChange}
                                        options={headItems4}
                                    />

                                    <Select
                                        defaultValue="재직 상태"
                                        variant="borderless"
                                        style={{ width: 110 }}
                                        onChange={handleStatusChange}
                                        options={headItems5}
                                    />
                                </div>
                            }

                            <div style={{ display: 'flex', width: '30%', minWidth: '100px', border: '1px solid gray', borderRadius: '8px', backgroundColor: 'white' }}>

                                <AiOutlineSearch style={{ fontSize: '20px', marginLeft: '8px', marginTop: '5px', color: '#ddddddff' }} />
                                <Input
                                    type="text"
                                    placeholder="검색 (이름, ID, 사번)"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setSelectedRowKeys([]); }}
                                    style={{
                                        width: '100%', border: 'none', outline: 'none',
                                        boxShadow: 'none'
                                    }} // 부모 div의 width를 꽉 채움
                                />

                            </div>
                        </Flex>

                        <Table className={style.table} rowSelection={rowSelection} columns={columns} dataSource={filteredUsers} pagination={{ position: ['bottomCenter'], hideOnSinglePage: true, onChange: handlePageChange }} />
                    </Flex>
                    {/* 테이블 아래쪽에 추가 */}
                    <Modal
                        title="삭제 확인"
                        open={openModal === 'delete'}
                        onOk={() => {
                            console.log('삭제 실행');
                            // TODO: 실제 삭제 처리
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => deleteUsers(selectedRowKeys)}>
                                삭제
                            </Button>
                        ]}
                        
                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr></hr>
                        <p>선택한 {selectedRowKeys.length}명의 사용자를 삭제하시겠습니까?</p>

                    </Modal>

                    <Modal
                        title="근로형태 수정"
                        open={openModal === 'empType'}
                        onOk={() => {
                            console.log('근로형태 수정 실행');
                            // TODO: 실제 수정 처리
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => updateEmpType(empTypeValue)}>
                                수정
                            </Button>
                        ]}
                        
                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr></hr>
                        <Select
                            style={{ width: '100%' }}
                            options={[
                                { value: '일반직', label: '일반직' },
                                { value: '임원,촉탁', label: '임원,촉탁' },
                            ]}
                            placeholder="근로형태 선택"
                            value={empTypeValue}          // 상태 연결
                            onChange={setEmpTypeValue}    // 상태 업데이트
                        />
                    </Modal>

                    <Modal
                        title="부서 수정"
                        open={openModal === 'dept'}
                        onOk={() => {
                            console.log('부서 수정 실행');
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => updateDept(deptValue)}>
                                수정
                            </Button>
                        ]}
                        
                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr></hr>
                        <Select
                            style={{ width: '100%' }}
                            options={departmentOptions}
                            placeholder="부서 선택"
                            value={deptValue}          // 상태 연결
                            onChange={setDeptValue}    // 상태 업데이트
                        />
                    </Modal>

                    <Modal
                        title="직위 수정"
                        open={openModal === 'rank'}
                        onOk={() => {
                            console.log('직위 수정 실행');
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => updateRank(rankValue)}>
                                수정
                            </Button>
                        ]}
                        
                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr></hr>
                        <Select
                            style={{ width: '100%' }}
                            options={positionOptions}
                            placeholder="직위 선택"
                            value={rankValue}          // 상태 연결
                            onChange={setRankValue}    // 상태 업데이트
                        />

                        
                    </Modal>

                    <Modal
                        title="직무 수정"
                        open={openModal === 'job'}
                        onOk={() => {
                            console.log('직무 수정 실행');
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => updateJob(jobValue)}>
                                수정
                            </Button>
                        ]}
                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr></hr>
                        <Select
                            style={{ width: '100%' }}
                            options={jobOptions}
                            placeholder="직무 선택"
                            value={jobValue}          // 상태 연결
                            onChange={setJobValue}    // 상태 업데이트
                        />
                    </Modal>

                    <Modal
                        title="재직상태 수정"
                        open={openModal === 'status'}
                         centered={false}        // 중앙 정렬 비활성화 (top 적용 가능하게)
                        onOk={() => {
                            console.log('재직 상태 수정 실행');
                            closeModal();
                        }}
                        onCancel={closeModal}
                        footer={[
                            <Button key="back" onClick={closeModal} className={style.cancelBtn}>
                                취소
                            </Button>,
                            <Button key="submit" type="primary" onClick={() => updateStatus(statusValue)}>
                                수정
                            </Button>
                        ]}
                        modalRender={modal => (
                            <div style={{ marginTop: '40%' }}> {/* 상단에서 50px 아래 */}
                                {modal}
                            </div>
                        )}
                    >
                        <hr></hr>
                        <Select
                            style={{ width: '100%' }}
                            options={[
                                { value: '재직자', label: '재직자' },
                                { value: '퇴사자', label: '퇴사자' },
                            ]}
                            placeholder="재직 상태 선택"
                            value={statusValue}          // 상태 연결
                            onChange={setStatusValue}    // 상태 업데이트
                        />
                    </Modal>
                </div>
            </div>
        </div>


    );
}

export default Management;