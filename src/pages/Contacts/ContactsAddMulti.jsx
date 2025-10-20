import { useState } from "react";
import styles from "./Contacts.module.css";
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";


const ContactsAddMulti = () => {

    const Navigate = useNavigate();

    const [Contacts, setContacts] = useState(
        { user_id: "김이사(임시)", name: "", phone: ``, email: "", type: "multi", team: "", jobRank: "" }
    );

    const handleInsertSolo = () => {
        Navigate("/contacts/add");
    }


    const handlechange = (e) => {

        setContacts(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleAdd = () => {
        const payload = {
            ...Contacts,
            phone: String(Contacts.phone)  // 문자열 강제
        };

        caxios.post("/contacts", payload, {
            headers: { "Content-Type": "application/json" }
        }).then((res) => {
            setContacts(res.data);
            window.close();
        });
    };

    const handleOut = () => {
        window.close();
    }


    return (

        <div className={styles.container}>
            <button onClick={handleInsertSolo}>개인주소록 </button>
            <div className={styles.mainHeader} style={{ fontSize: "40px", backgroundColor: "#007bff", color: "white" }}>
                공용 주소록 추가
            </div>

            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>성함 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top" }}
                        onChange={handlechange} name="name" value={Contacts.name} />
                </div>


                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>전화번호 : </div>
                    <input type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top" }}
                        onChange={handlechange} name="phone" value={Contacts.phone} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>이메일 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top" }}
                        onChange={handlechange} name="email" value={Contacts.email} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>부서 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top" }}
                        onChange={handlechange} name="team" value={Contacts.team} />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}> 직급: </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top" }}
                        onChange={handlechange} name="jobRank" value={Contacts.jobRank} />
                </div>



            </div>
            <button style={{ float: "right", marginLeft: "10px" }} onClick={handleOut}>취소</button>
            <button style={{ float: "right" }} onClick={handleAdd}>생성</button>


        </div>
    );
}


export default ContactsAddMulti;