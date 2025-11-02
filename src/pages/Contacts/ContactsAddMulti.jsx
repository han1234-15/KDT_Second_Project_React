import { useState } from "react";
import styles from "./Contacts.module.css";
import { caxios } from '../../config/config.js';


const ContactsAddMulti = ({ onClose, handleContactsList }) => {



    const [Contacts, setContacts] = useState(
        { user_id: "", name: "", phone: ``, email: "", type: "multi", job_code: "", rank_code: "" }
    );



    const handlechange = (e) => {

        setContacts(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleAdd = () => {

        const name = Contacts.name.trim();
        let phone = Contacts.phone.trim();
        let email = Contacts.email.trim()

        // 1 필수 입력 체크
        if (!name) {
            alert("이름을 입력해주세요.");
            return;
        }
        if (!phone) {
            alert("전화번호를 입력해주세요.");
            return;
        }
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }
        // 이름 체크
        const nameRegex = /^[가-힣a-zA-Z\s]{2,6}$/;

        // 번호 체크
        const phoneRegex = /^010-\d{4}-\d{4}$/;

        // 이메일 체크
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!nameRegex.test(name)) {
            alert("이름에는 숫자나 특수문자를 포함할 수 없습니다 (2~6글자).");
            return;
        }


        if (!phoneRegex.test(phone)) {
            alert("전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678");
            return;
        }


        if (!emailRegex.test(email)) {
            alert("올바른 이메일 형식이 아닙니다.");
            return;
        }

        const payload = {
            ...Contacts,
            phone: String(Contacts.phone)  // 문자열 강제
        };

        caxios.post("/contacts", payload, {
            headers: { "Content-Type": "application/json" }

        }).then((res) => {
            // setContacts(res.data);
            handleContactsList();
            onClose();
        }).catch(err => {
            console.error("주소록 등록 오류:", err.response);

            alert(err.response.data);


        });
    };

    const handleOut = () => {
        onClose();
    }


    return (

        <div className={styles.container}>

            <div className={styles.mainHeader} style={{ fontSize: "40px", textAlign: "center" }}>
                공용 주소록 추가
            </div>
            <br></br>
            <div className={styles.mainBody} style={{ border: "none" }}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>성함 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="name" value={Contacts.name} />
                </div>

                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>전화번호 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="phone" value={Contacts.phone} />
                </div>
                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>이메일 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="email" value={Contacts.email} />
                </div>
                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}>부서 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="job_code" value={Contacts.job_code} />
                </div>
                <br></br>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1} style={{ marginLeft: "30px" }}> 직위 </div>
                    <input type="text" className={styles.NewSharedMailbox2}
                        style={{ marginLeft: "20px", border: "1px solid lightgrey", borderRadius: "10px", textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="rank_code" value={Contacts.rank_code} />
                </div>



            </div>
            <button style={{ float: "right", marginTop: "10px", marginLeft: "10px" }} onClick={handleOut}>취소</button>
            <button style={{ float: "right", marginTop: "10px" }} onClick={handleAdd}>완료</button>
        </div>
    );
}


export default ContactsAddMulti;