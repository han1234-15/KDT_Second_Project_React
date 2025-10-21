import style from './Management.module.css'
import { Link } from 'react-router-dom';

import { AuditOutlined, ClusterOutlined, DownOutlined, FileDoneOutlined, ProfileOutlined, RestOutlined, UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Dropdown, Input, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { Button, Flex, Table } from 'antd';
import { caxios } from '../../config/config';
import { CiSearch } from "react-icons/ci";

import dayjs from "dayjs";

const Management = () => {


    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState('');
    const [userCount, setUserCount] = useState(0); //그룹웨어 사용 인원
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
        { label: (<span onClick={() => fetchUsers({ status: 'all' })}>전체</span>), key: '0', },
        { label: (<span onClick={() => fetchUsers({ status: 'active' })}>재직자</span>), key: '1' },
        { label: (<span onClick={() => fetchUsers({ status: 'inactive' })}>퇴사자</span>), key: '2', },
    ];

    const headItems2 = [
        { label: <span onClick={() => fetchUsers({ dept: 'all' })}>전체</span>, key: '0' },
        { label: <span onClick={() => fetchUsers({ dept: 'rnd' })}>연구&개발</span>, key: '1' },
        { label: <span onClick={() => fetchUsers({ dept: 'biz' })}>사업관리팀</span>, key: '2' },
        { label: <span onClick={() => fetchUsers({ dept: 'ai' })}>AI센터</span>, key: '3' },
        { label: <span onClick={() => fetchUsers({ dept: 'hr' })}>인사관</span>, key: '4' },
        { label: <span onClick={() => fetchUsers({ dept: 'finance' })}>재무/회계</span>, key: '5' },
        { label: <span onClick={() => fetchUsers({ dept: 'marketing' })}>마케팅팀</span>, key: '6' },
    ];

    const headItems3 = [
        { label: <span onClick={() => fetchUsers({ employment: 'all' })}>전체</span>, key: '0' },
        { label: <span onClick={() => fetchUsers({ employment: 'general' })}>일반직</span>, key: '1' },
        { label: <span onClick={() => fetchUsers({ employment: 'executive' })}>임원,촉탁</span>, key: '2' },
    ];

    // 공통 fetchUsers 함수
    const fetchUsers = (filter = {}) => {
        let url = '/member';
        const params = new URLSearchParams();

        if (filter.status && filter.status !== 'all') params.append('status', filter.status);
        if (filter.dept && filter.dept !== 'all') params.append('dept', filter.dept);
        if (filter.employment && filter.employment !== 'all') params.append('employment', filter.employment);

        const queryStr = params.toString();
        if (queryStr) url += `?${queryStr}`;

        caxios.get(url)
            .then(resp => {
                setUsers(resp.data);
                setUserCount(resp.data.length);
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
    ];

    const filteredUsers = users
        .filter(user =>
            user.name.includes(search) ||
            user.id.includes(search) ||
            user.employee_no.includes(search)
        )
        .map(user => ({ ...user, key: user.id })); // key 추가

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);

    const start = () => {
        setLoading(true);
        // ajax request after empty completing
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };
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

    return (
        <div className={style.container}>
            <div className='header'>
                <Link to="/somepath">사용자 관리</Link>
                <Link to="/somepath">사용자 접속 내역</Link>
                <Link to="/somepath">관리자 설정</Link>
                <Link to="/somepath">메일 아카이빙</Link>

            </div>
            <div className='body'>
                <div style={{ fontWeight: 500 }}>사용자 현황 {userCount}명</div>
                <div className={style.userManageBtn}>
                    <Link to="/management/register"><button>사용자 등록</button></Link>
                    <Link to="/"><button>비활성 사용자</button></Link>

                </div>
                <div style={{ maxWidth: "1400px" }}>
                    <Flex gap="middle" vertical>
                        <Flex align="center" gap="middle">
                            {hasSelected ?
                                <div className={style.tableHead}>
                                    <span style={{ marginRight: '5px' }}><UserOutlined /> {selectedRowKeys.length}명</span>
                                    <button><RestOutlined /> 삭제</button>
                                    <button><UserSwitchOutlined /> 근로형태 수정</button>
                                    <button><ClusterOutlined /> 부서 수정</button>
                                    <button><AuditOutlined /> 직위 수정</button>
                                    <button><FileDoneOutlined /> 직무 수정</button>
                                </div>
                                :
                                <div style={{ width: '70%' }}>
                                    <label></label>
                                    <span style={{ paddingRight: '10px', paddingLeft: '20px' }}>
                                        <Dropdown menu={{ items: headItems1 }} trigger={['click']} >
                                            <a onClick={e => e.preventDefault()}>
                                                <Space>
                                                    재직 상태
                                                    <DownOutlined />
                                                </Space>
                                            </a>
                                        </Dropdown>
                                    </span>
                                    <span style={{ paddingRight: '10px', paddingLeft: '20px' }}>
                                        <Dropdown menu={{ items: headItems2 }} trigger={['click']} >
                                            <a onClick={e => e.preventDefault()}>
                                                <Space>
                                                    소속 부서
                                                    <DownOutlined />
                                                </Space>
                                            </a>
                                        </Dropdown>
                                    </span>
                                    <span style={{ paddingRight: '10px', paddingLeft: '20px' }}>
                                        <Dropdown menu={{ items: headItems3 }} trigger={['click']} >
                                            <a onClick={e => e.preventDefault()}>
                                                <Space>
                                                    근로 형태
                                                    <DownOutlined />
                                                </Space>
                                            </a>
                                        </Dropdown>
                                    </span>
                                </div>
                            }

                            <div style={{ display: 'flex', width: '30%', minWidth: '100px', border: '1px solid gray', borderRadius: '8px', backgroundColor: 'white' }}>

                                <CiSearch style={{ fontSize: '29px', marginRight: '1px', marginLeft: '4px' }} />
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

                        <Table rowSelection={rowSelection} columns={columns} dataSource={filteredUsers} pagination={{ position: ['bottomCenter'], hideOnSinglePage: true, onChange: handlePageChange }} />
                    </Flex>
                </div>
            </div>
        </div>


    );
}

export default Management;