import styles from "./Contacts.module.css";


const ContactsAdd = () => {


    return (

        <div className={styles.container}>

            <div className={styles.mainHeader} style={{ fontSize: "40px", backgroundColor: "#007bff", color: "white" }}>
                새로운 주소록 추가
            </div>

            <div className={styles.mainBody}>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>이름 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>메일 주소  : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>


                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>전화번호 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2} style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>

                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>소속 팀 : </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>
                <div className={styles.mainBodybox} style={{ display: "flex", marginBottom: "10px" }}>
                    <div className={styles.NewSharedMailbox1}>직급: </div>
                    <textarea type="text" className={styles.NewSharedMailbox2}  style={{ textAlign: "left", verticalAlign: "top" }}/>
                </div>

    

            </div>

    <button style={{ float: "right", marginLeft: "10px" }}>취소</button>   <button style={{ float: "right" }}>생성</button>

        </div>
    );
}


export default ContactsAdd;