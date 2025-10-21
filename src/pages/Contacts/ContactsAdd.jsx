import { useState } from "react";
import styles from "./Contacts.module.css";
import { caxios } from '../../config/config.js';


const ContactsAdd = ({ onClose }) => {


  
    const [Contacts, setContacts] = useState(
        { user_id: "", name: "", phone: "", email: "", type: "solo", job_code: "", rank_code: "" }
    );


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
            onClose();
        });
    };


    const handleOut = () => {
        onClose();
    }


    return (

        <div className={styles.container}>
         
            <div className={styles.mainHeader} style={{ fontSize: "40px", backgroundColor: "#007bff", color: "white" , textAlign:"center" }}>
                개인 주소록 추가
            </div>
     <br></br>
            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>성함 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="name" value={Contacts.name} />
                </div>


                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>전화번호 : </div>
                      <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="phone" value={Contacts.phone} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>이메일 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="email" value={Contacts.email} />
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>부서 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="job_code" value={Contacts.job_code} />
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}> 직급: </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top", color: "black" }}
                        onChange={handlechange} name="rank_code" value={Contacts.rank_code} />
                </div>



            </div>
            <button style={{ float: "right", marginLeft: "10px" }} onClick={handleOut}>취소</button>
            <button style={{ float: "right" }} onClick={handleAdd}>완료</button>


        </div>
    );
}


export default ContactsAdd;