import styles from "./Contacts.module.css";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const ContactsMulti = () => {

    const Navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태

    // 전체 주소록
    const handleContacts = () => {
        Navigate("/contacts");
    }
    // 개인 주소록
    const handleContactsSolo = () => {
        Navigate("/contacts/solo");
    }

    // 주소록 삭제
    const handleContactsDelete = () => {
        axios.delete("http://10.5.5.20/contacts", { data: { seqList: checkedList }, withCredentials: true }).then(resp => {
            setContacts(prev => prev.filter(contact => !checkedList.includes(contact.seq)));
        });
    }



    // 개인 주소록으로 이동
    const handleContactsUpdateTypeSingle = () => {
        axios.put("http://10.5.5.20/contacts", { seqList: checkedList, type: "solo" }, { withCredentials: true })
            .then(resp => {
                setContacts(prev => prev.map(contact =>
                    checkedList.includes(contact.seq)
                        ? { ...contact, type: "solo" }
                        : contact
                ));
            });
    }

    // 전체 체크박스를 클릭하면(true) 아래 체크박스 전체 적용
    useEffect(() => {
        if (contacts.length > 0 && checkedList.length === contacts.length) {
            setAllChecked(true);
        } else {
            setAllChecked(false);
        }
    }, [checkedList, contacts]);

    // 전체 체크박스 선택
    const handleAllcheckbox = () => {
        if (!allChecked) {
            // 모든 체크
            setCheckedList(contacts.map(contact => contact.seq));
            setAllChecked(true);
        } else {
            // 모두 해제
            setCheckedList([]);
            setAllChecked(false);
        }
    }

    // 개별 체크박스 선택
    const handleSingleCheck = (seq) => {
        if (checkedList.includes(seq)) {
            setCheckedList(checkedList.filter(id => id !== seq));
        } else {
            setCheckedList([...checkedList, seq]);
        }
    }


    // 주소록 추가 
    const handleContactsAdd = () => {
        window.open(
            "/contacts/add",
            "ContactsAdd", // 새 창 이름
            "width=1400,height=800,resizable=yes,scrollbars=yes"
        )
    }
    // 전체 주소록 리스트 
    const handleDefaultGet = () => {

        axios.get("http://10.5.5.20/contacts?type=multi", { withCredentials: true }).then(resp => {
            setContacts(prev => resp.data);
        });
    }
    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleDefaultGet();
    }, []);



    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>



                {/* 주소록 헤더 1 */}
                <div className={styles.mainHeadertop} >
                    공유 주소록 <br />
                    <button onClick={handleContacts}>전체 주소록</button>
                    <button onClick={handleContactsSolo}>개인 주소록</button>

                </div>

                {/* 주소록 헤더 2 */}
                <div className={styles.mainHeaderbottom} >
                    {checkedList.length === 0 ? (
                        <>
                            <input type="text" placeholder="검색할 주소록 이름" style={{ width: "50%", height: "50%", borderRadius: "5px", border: "none", justifyContent: "center" }}></input>
                            <button>검색</button>
                            <button className={styles.createbtn} onClick={handleContactsAdd}> 주소록 추가 </button>
                        </>) : (
                        <>
                            <button onClick={handleContactsDelete}> 삭제 </button>
                            <button onClick={handleContactsUpdateTypeSingle}> 개인 주소록으로 이동 </button>
                        </>
                    )}
                </div>


            </div> {/* 주소록 헤더  */}
            <hr></hr>

            {/* 주소록 바디 여기가 계속 변하는곳 Route */}
            <div className={styles.mainBody}>



                <div className={styles.mainBodyHeader}>
                    <div className={styles.mainBodycheckbox}><input type="checkbox" onClick={handleAllcheckbox} /></div>
                    <div className={styles.mainBodytag}>성함</div>
                    <div className={styles.mainBodytag}>전화번호</div>
                    <div className={styles.mainBodytag}>이메일 </div>
                    <div className={styles.mainBodytag}>부서</div>
                    <div className={styles.mainBodytag}>직급</div>
                </div>
                <hr></hr>

                {/* 주소록 출력  */}
                <div className={styles.mainBodylist}>


                    {contacts.map(e =>
                        <div key={e.seq}>
                            <div className={styles.mainBodycheckbox}><input type="checkbox" checked={checkedList.includes(e.seq)} onChange={() => handleSingleCheck(e.seq)} /></div>
                            <div className={styles.mainBodytag}>{e.name}</div>
                            <div className={styles.mainBodytag}>{e.phone}</div>
                            <div className={styles.mainBodytag}>{e.email}</div>
                            <div className={styles.mainBodytag}>{e.team}</div>
                            <div className={styles.mainBodytag}>{e.jobRank}</div><br></br>
                            <hr></hr>
                        </div>

                    )}
                </div>


            </div>{/* 주소록 바디 */}

        </div> {/* 메인 주소록창  */}


    </div>



    );
}

export default ContactsMulti;