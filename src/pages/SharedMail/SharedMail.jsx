import styles from "./SharedMail.module.css";




const SharedMail = () => {

    const handleNewSharedMail = () => {
        window.open(
             "/sharedmail/write",
            "NewSharedMail",
            "width=1200,height=800,resizable=yes,scrollbars=yes"
        )
    }


    return (<div className={styles.container}>


        {/* 메인 공용메일창 */}
        <div className={styles.main}>

            {/* 헤더  */}
            <div className={styles.mainHeader} style={{ textAlign: "center", fontSize: "50px" }}>
                공용메일
            </div> {/*  헤더  */}


            {/* 바디 여기가 계속 변하는곳 Route */}
            <div className={styles.mainBody}>

            </div>  {/* 주소록 바디 */}

        </div> {/* 메인 주소록창  */}

        {/* 오른쪽 주소록 바 */}
        <div className={styles.rightbar}>

            <div className={styles.rightbarHeader}>

                <button className={styles.createbtn} onClick={handleNewSharedMail}> 공용메일 신청 </button>
               
            </div>

        </div>


    </div>








    );
}

export default SharedMail;