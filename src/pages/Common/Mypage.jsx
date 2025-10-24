import React, { useEffect, useState } from "react";
import styles from "./Mypage.module.css";
import { UserOutlined } from '@ant-design/icons';
import { Input, Space, Select } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { caxios } from "../../config/config";
import { departmentOptions, jobOptions, positionOptions } from '../../config/options';
import { useDaumPostcodePopup } from 'react-daum-postcode'; // Daum 주소 검색 관련 hook

const Mypage = () => {
    
    //다음 주소 api
    const postcodeScriptUrl = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    const open = useDaumPostcodePopup(postcodeScriptUrl);

    const handleComplete = (data) => {
        console.log(data);

        setMemberInfo(prev => ({ ...prev, zip_code: data.zonecode }));
        setMemberInfo(prev => ({ ...prev, address_line1: data.address }));
    };

    const handleClickZipcode = () => {
        open({ onComplete: handleComplete });
    };
    //여기까지가 다음 주소 api


    const navigate = useNavigate();

    const [memberInfo, setMemberInfo] = useState({
        id: "",
        password: "",
        name: "",
        englishName: "",
        employmentType: "일반직",
        hire_date: "",
        dept_code: "연구&개발",
        rank_code: "사원",
        job_code: "기획",
        personalEmail: "",
        officePhone: "",
        mobilePhone: "",
        birthDate: "",
        calendarType: "S",
        zip_code: "",
        address_line1: "",
        address_line2: "",
    });

    const handleMemberInfoChange = (e) => {
        const { name, value } = e.target;
        if (name == "password") {
            console.log("값은 : " + value);
        }
        setMemberInfo(prev => ({ ...prev, [name]: value }));
    }

    const handleAdd = async () => {
        //데이터를 보낼 때는 post를 쓴다.
        // 필수값 체크
        const requiredFields = [
            { name: "id", label: "ID" },
            { name: "name", label: "이름" },
            { name: "employmentType", label: "근로형태" },
            { name: "hire_date", label: "입사일" },
            { name: "dept_code", label: "부서" },
            { name: "rank_code", label: "직위" },
            { name: "job_code", label: "직무" }
        ];

        for (let field of requiredFields) {
            if (!memberInfo[field.name] || memberInfo[field.name].trim() === "") {
                alert(`${field.label} 입력은 필수로 필요합니다.`);
                return;
            }
        }

        // ID 형식 체크 (알파벳+숫자 4~20자리)
        // const idRegex = /^[a-z0-9]{4,20}$/;
        // if (!idRegex.test(memberInfo.id)) {
        //     alert("ID는 4~20자리 알파벳 소문자와 숫자만 가능합니다.");
        //     return;
        // }


        // 비밀번호 형식 체크 (최소 8자리, 대문자, 소문자, 숫자, 특수문자 포함)
        const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (memberInfo.password != null && memberInfo.password != "" && !pwRegex.test(memberInfo.password)) {
            alert("비밀번호는 최소 8자리, 대문자/소문자/숫자/특수문자를 포함해야 합니다.");
            return;
        }

        // 이름 체크 (한글 또는 영어만)
        const nameRegex = /^[가-힣]{2,20}$/;
        if (!nameRegex.test(memberInfo.name)) {
            alert("이름은 2~20자리 한글만 가능합니다. ");
            return;
        }

        const englishNameRegex = /^[a-zA-Z]{2,20}$/;
        if (memberInfo.englishName != "" && !englishNameRegex.test(memberInfo.englishName)) {
            alert("영어 이름은 2~20자리 영어만 가능합니다. ");
            return;
        }

        // 5️⃣ 이메일 형식 체크 (있으면)
        if (memberInfo.personalEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(memberInfo.personalEmail)) {
                alert("이메일 형식이 올바르지 않습니다.");
                return;
            }
        }

        // 휴대전화/회사전화 형식 체크 (있으면)
        const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/; // ex: 010-1234-5678
        if (memberInfo.mobilePhone && !phoneRegex.test(memberInfo.mobilePhone)) {
            alert("휴대전화 형식이 올바르지 않습니다. 예: 010-1234-5678");
            return;
        }

        const officePhoneRegex = /^\d{2,10}$/; // ex: 010-1234-5678
        if (memberInfo.officePhone && !officePhoneRegex.test(memberInfo.officePhone)) {
            alert("회사전화는 숫자만 입력해주시길 바랍니다.예: 100");
            return;
        }

        //  생년월일 형식 체크 (있으면)
        if (memberInfo.birthDate) {
            const birthRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!birthRegex.test(memberInfo.birthDate)) {
                alert("생년월일 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력하세요.");
                return;
            }
        }

        // 우편번호/주소 체크 (있으면)
        if (memberInfo.zip_code && !/^\d{5}$/.test(memberInfo.zip_code)) {
            alert("우편번호 형식이 올바르지 않습니다. 5자리 숫자로 입력하세요.");
            return;
        }

        // 세부 주소 체크 (한글 또는 영어만)
        const address_line2Regex = /^[가-힣a-zA-Z0-9\s\-#]{2,40}$/;
        if (memberInfo.address_line2 && !address_line2Regex.test(memberInfo.address_line2)) {
            alert("상세주소는 2~40자리 한글,영어,숫자만 입력 가능합니다. ");
            return;
        }

        const formData = new FormData();

        formData.append("member", new Blob([JSON.stringify(memberInfo)], { type: "application/json" }));
        // 새 이미지 파일이 있는 경우만 업로드
        if (profileImage && profileImage instanceof File) {
            formData.append("profileImage", profileImage);
        }

        // 기존 이미지 삭제 여부 플래그
        formData.append("deleteProfile", deleteProfile)
        try {
            const resp = await caxios.post("/member/member", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("회원 수정 성공");
            navigate("/management");
            window.location.reload();
        } catch (err) {
            alert("회원 수정 실패");
        }

    }

    const [profileImage, setProfileImage] = useState(null); // 파일 객체
    const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 URL
    // 미리보기 메모리 해제


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드 가능합니다.");
            e.target.value = ""; // <- 추가
            return;
        }

        setProfileImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setDeleteProfile(false); // 선택 시 삭제 플래그 초기화

        e.target.value = ""; // <- 이 줄이 중요
    };

    //기존에 있던 프로필 이미지이라서 null인지 삭제해서 null인지 체크용
    const [deleteProfile, setDeleteProfile] = useState(false);

    const handleRemoveImage = () => {
        setProfileImage(null);
        setPreviewUrl(null);
        setDeleteProfile(true); // 삭제 의사 표시
    };

    const [loading, setLoading] = useState(true); //로딩 확인용 상태변수

    const { id: checkUserId } = useParams(); // URL에서 id를 userId로 가져옴

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchUserData = async () => {
            try {
                await caxios.get("/auth/check");
                //관리자인지 체크 먼저하고

                const memberResp = await caxios.get(`/member/info/${checkUserId}`);
                const data = memberResp.data;

                // 날짜 변환
                const formattedHireDate = data.hire_date
                    ? new Date(data.hire_date).toISOString().split("T")[0]
                    : "";

                const formattedBirthDate = data.birthDate
                    ? new Date(data.birthDate).toISOString().split("T")[0]
                    : "";

                //확인할 유저 아이디 불러오기.
                console.log(memberResp);
                console.log(memberResp.data);
                setMemberInfo({
                    ...data,
                    hire_date: formattedHireDate,
                    birthDate: formattedBirthDate,
                });

                console.log("프로필이미지:" + profileImage);
                if(memberResp.data.profileImage_servName != null)
                {
                    setPreviewUrl("https://storage.googleapis.com/yj_study/" + memberResp.data.profileImage_servName); //이미지 넣는거
                }
                setLoading(false); // 여기서 false로 변경
            } catch (err) {
                console.error(err);
                navigate("/");
            }
        };

        fetchUserData();
    }, []);


    //토큰을 확인하는데 시간이 걸려서 loading으로 토큰 확인이 끝나기 전까지 다른 컴포넌트가 렌더링 되지 않도록 함.
    if (loading) {
        return null; // 혹은 스켈레톤 화면, 로딩 스피너
    }

    return (
        <div className={styles.container}>

            <h1>사용자 수정</h1>

            <div className={styles.content}>
                {/* ----------left는 프로필 들어가는 자리 */}
                <div className={styles.left}>
                    <div className={styles.profileContainer}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="프로필 미리보기" className={styles.profileImage} />
                        ) : (
                            <div className={styles.placeholder}>
                                <UserOutlined style={{ fontSize: '36px', color: '#aaa' }} />
                            </div>
                        )}
                        <div className={styles.profileButtons}>
                            <label htmlFor="profileUpload" className={styles.uploadBtn}>이미지 선택</label>
                            {previewUrl && (
                                <div><button onClick={handleRemoveImage} className={styles.removeBtn}>삭제</button></div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            id="profileUpload"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                    </div>
                </div>
                <div className={styles.right}>
                    <div>
                        <label>ID*</label>
                        <div style={{ paddingLeft: '2px' }}>{memberInfo.id}</div>
                    </div>
                    <div><label>비밀번호 변경</label><Input placeholder="최소 8자리, 대문자, 소문자, 숫자, 특수문자" name='password' value={memberInfo.password} onChange={handleMemberInfoChange} /></div>
                    <div><label>이름*</label><Input placeholder="한글 2~20자리" name='name' value={memberInfo.name} onChange={handleMemberInfoChange} /></div>
                    <div><label>영어 이름</label><Input placeholder="영문 이름 입력" name='englishName' value={memberInfo.englishName} onChange={handleMemberInfoChange} /></div>

                    <div>
                        <label>근로형태*</label>
                        <Space wrap>
                            <Select
                                value={memberInfo.employmentType}
                                style={{ width: 200 }}
                                onChange={(value) =>                     // 선택하면 state 업데이트
                                    setMemberInfo(prev => ({ ...prev, employmentType: value }))
                                }
                                options={[

                                    { value: '일반직', label: '일반직' },
                                    { value: '임원,촉탁', label: '임원,촉탁' },
                                ]}
                            />

                        </Space>
                    </div>

                    <div className={styles.hire_date}>
                        <label>입사일*</label>
                        <Input
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={memberInfo.hire_date ? memberInfo.hire_date.slice(0, 10) : ""}

                            onChange={(e) =>
                                setMemberInfo(prev => ({ ...prev, hire_date: e.target.value }))
                            }
                        />
                    </div>
                    {/* <div><label>사번*</label><Input placeholder="사번 입력" /></div> */}


                    <div>
                        <label>부서*</label>
                        <Space wrap>
                            <Select
                                value={memberInfo.dept_code}
                                style={{ width: 200 }}
                                onChange={(value) =>                     // 선택하면 state 업데이트
                                    setMemberInfo(prev => ({ ...prev, dept_code: value }))
                                }
                                options={departmentOptions}
                            />
                        </Space>
                    </div>
                    <div>
                        <label>직위*</label><Space wrap>
                            <Select
                                value={memberInfo.rank_code}
                                style={{ width: 200 }}
                                onChange={(value) =>                     // 선택하면 state 업데이트
                                    setMemberInfo(prev => ({ ...prev, rank_code: value }))
                                }
                                options={positionOptions}
                            />

                        </Space>
                    </div>
                    <div>
                        <label>직무*</label><Space wrap>
                            <Select
                                value={memberInfo.job_code}
                                style={{ width: 200 }}
                                onChange={(value) =>                     // 선택하면 state 업데이트
                                    setMemberInfo(prev => ({ ...prev, job_code: value }))
                                }
                                options={jobOptions}
                            />

                        </Space>
                    </div>

                    <div><label>개인 이메일</label><Input placeholder="example@email.com" name='personalEmail' value={memberInfo.personalEmail} onChange={handleMemberInfoChange} /></div>
                    <div><label>회사전화</label><Input placeholder="회사 전화 입력" name='officePhone' value={memberInfo.officePhone} onChange={handleMemberInfoChange} /></div>
                    <div><label>휴대전화</label><Input placeholder="휴대전화 입력" name='mobilePhone' value={memberInfo.mobilePhone} onChange={handleMemberInfoChange} /></div>

                    <div className={styles.birth}>
                        <label>생년월일</label>
                        <Input
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={memberInfo.birthDate ? memberInfo.birthDate.slice(0, 10) : ""}
                            onChange={(e) =>
                                setMemberInfo(prev => ({ ...prev, birthDate: e.target.value }))
                            }
                        />
                        <span className={styles.birthSpan}>
                            <input type="radio" id="solar" checked={memberInfo.calendarType === "S"} name="calendarType" value="S" onChange={() => setMemberInfo(prev => ({ ...prev, calendarType: "S" }))} />
                            <label htmlFor="solar" className={styles.birthLabel}>양력</label>
                            <input type="radio" id="lunar" checked={memberInfo.calendarType === "L"} name="calendarType" value="L" onChange={() => setMemberInfo(prev => ({ ...prev, calendarType: "L" }))} />
                            <label htmlFor="lunar" className={styles.birthLabel}>음력</label>
                        </span>
                    </div>

                    <div>
                        <label>주소</label>
                        <Input readOnly name='zip_code' value={memberInfo.zip_code} onChange={handleMemberInfoChange} placeholder="우편 번호" />
                        <button onClick={handleClickZipcode} >우편번호 검색</button>
                    </div>
                    <div>
                        <label></label>
                        <Input readOnly name="address_line1"
                            value={memberInfo.address_line1}
                            onChange={handleMemberInfoChange}
                            placeholder="주소" />

                    </div>
                    <div>
                        <label></label>
                        <Input placeholder="상세 주소 입력" name="address_line2"
                            value={memberInfo.address_line2}
                            onChange={handleMemberInfoChange} />
                    </div>
                    <div className={styles.bottomButton}>
                        <button onClick={handleAdd}>수정</button>
                        <button onClick={() => navigate(-1)}>취소</button>
                    </div>
                </div>
            </div>

        </div >
    );
}

export default Mypage;
