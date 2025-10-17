import style from './Management.module.css'
import { Link } from 'react-router-dom';

import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import React, { useState } from 'react';
import { Button, Flex, Table } from 'antd';

const Management = () => {
    const headItems1 = [
        {
            label: (
                <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
                    1st menu item
                </a>
            ),
            key: '0',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    2nd menu item
                </a>
            ),
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: '3rd menu item',
            key: '3',
        },
    ];

    const headItems2 = [
        {
            label: (
                <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
                    1st menu item
                </a>
            ),
            key: '0',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    2nd menu item
                </a>
            ),
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: '3rd menu item',
            key: '3',
        },
    ];

    const headItems3 = [
        {
            label: (
                <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
                    1st menu item
                </a>
            ),
            key: '0',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    2nd menu item
                </a>
            ),
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: '3rd menu item',
            key: '3',
        },
    ];

    const columns = [
        { title: '이름', dataIndex: 'name' },
        { title: 'ID', dataIndex: 'id' },
        { title: '사번', dataIndex: 'employeeCode' },
        { title: '근로 형태', dataIndex: 'employmentType' },
        { title: '입사일', dataIndex: 'hireDate' },
        { title: '소속 조직', dataIndex: 'department' },
        { title: '직위', dataIndex: 'position' },
        { title: '직무', dataIndex: 'jobTitle' },
    ];
    const dataSource = Array.from({ length: 46 }).map((_, i) => ({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address: `London, Park Lane no. ${i}`,
    }));

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
    return (
        <div className={style.container}>
            <div className='header'>
                <Link to="/somepath">사용자 관리</Link>
                <Link to="/somepath">사용자 접속 내역</Link>
                <Link to="/somepath">관리자 설정</Link>
                <Link to="/somepath">메일 아카이빙</Link>

            </div>
            <div className='body'>
                <div>사용자 현황 n명</div>
                <div>
                    <Link to="/management/register"><button>사용자 등록</button></Link>
                    <Link to="/"><button>비활성 사용자</button></Link>

                </div>


                <div>
                    <Flex gap="middle" vertical>
                        <Flex align="center" gap="middle">
                            {hasSelected ? `Selected ${selectedRowKeys.length} items` :
                                <div>
                                    <Dropdown menu={{ items: headItems1 }} trigger={['click']} >
                                        <a onClick={e => e.preventDefault()}>
                                            <Space>
                                                재직 상태
                                                <DownOutlined />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                    <Dropdown menu={{ items: headItems2 }} trigger={['click']}>
                                        <a onClick={e => e.preventDefault()}>
                                            <Space>
                                                소속 조직
                                                <DownOutlined />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                    <Dropdown menu={{ items: headItems3 }} trigger={['click']}>
                                        <a onClick={e => e.preventDefault()}>
                                            <Space>
                                                근로 형태
                                                <DownOutlined />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                </div>
                            }
                        </Flex>
                        <Table rowSelection={rowSelection} columns={columns} dataSource={dataSource} pagination={{ position: ['bottomCenter'] }} />
                    </Flex>
                </div>
            </div>
        </div>


    );
}

export default Management;