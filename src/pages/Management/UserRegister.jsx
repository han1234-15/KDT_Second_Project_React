import React, { useState } from "react";

import styles from "./UserRegister.module.css";

import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, Space } from 'antd';
import { Link } from "react-router-dom";

import { Cascader } from 'antd';


const UserRegister = () => {
    const options = [
        {
            value: '일반직',
            label: 'normal',

        },
        {
            value: '임원,촉탁',
            label: 'Jiangsu',

        },
    ];
    const onChange = value => {
        console.log(value);
    };
    



    return (
        <div className={styles.container}>

            <h1>사용자 등록</h1>

            <div className={styles.content}>
                <div className={styles.left}>프로필들어갈자링ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ


                </div>
                <div className={styles.right}>
                    <div><label>이름*</label><Input placeholder="이름 입력" /></div>
                    <div><label>영어 이름</label><Input placeholder="영문 이름 입력" /></div>
                    <div><label>ID*</label><Input placeholder="아이디 입력" /></div>
                    <div><label>비밀번호*</label><Input placeholder="비밀번호 입력" /></div>
                    <div>
                        <label>근로형태*</label>
                        <Cascader options={options} onChange={onChange} placeholder="Please select" />
                    </div>

                    <div><label>입사일*</label><Input placeholder="YYYY-MM-DD" /></div>
                    <div><label>사번*</label><Input placeholder="사번 입력" /></div>
                    <div><label>소속조직*</label><Input placeholder="소속 입력" /></div>
                    <div><label>직위*</label><Input placeholder="직위 입력" /></div>
                    <div><label>직무*</label><Input placeholder="직무 입력" /></div>
                    <div><label>개인 이메일</label><Input placeholder="example@email.com" /></div>
                    <div><label>회사전화</label><Input placeholder="회사 전화 입력" /></div>
                    <div><label>휴대전화</label><Input placeholder="휴대전화 입력" /></div>

                    <div className={styles.birth}>
                        <label>생년월일</label>
                        <Input type="date" placeholder="YYYY-MM-DD" />
                        <input type="radio" name="calendar" value="P" /> 양력
                        <input type="radio" name="calendar" value="M" /> 음력
                    </div>

                    <div >

                        <label>주소</label>
                        <button >우편번호 검색</button>
                        <Input readOnly />


                    </div>
                    <div>
                        <label></label>
                        <Input placeholder="상세 주소 입력" />
                    </div>
                    <div className={styles.bottomButton}>
                        <button>등록</button>
                        <button>취소</button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default UserRegister;
