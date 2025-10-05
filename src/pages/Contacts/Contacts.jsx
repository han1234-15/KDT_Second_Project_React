import styles from "./Contacts.module.css";


const Contacts = () => {



    // 주소록 추가 
    const handleContactsAdd = () => {


        window.open(
            "/contactsadd",
            "ContactsAdd", // 새 창 이름
            "width=1400,height=800,resizable=yes,scrollbars=yes"
        )
    }

    return (<div className={styles.container}>


        {/* 메인 주소록창 */}
        <div className={styles.main}>

            {/* 주소록 헤더  */}
            <div className={styles.mainHeader}>
                <div className={styles.mainHeadertag}>이름</div>
                <div className={styles.mainHeadertag}>이메일</div>
                <div className={styles.mainHeadertag}>전화번호</div>
                <div className={styles.mainHeadertag}>팀</div>
                <div className={styles.mainHeadertag}>직급</div>
            </div> {/* 주소록 헤더  */}


            {/* 주소록 바디 여기가 계속 변하는곳 Route */}
            <div className={styles.mainBody}>

                {/* 주소록 출력  */}
                <div className={styles.mainBodytag}>박민규</div>
                <div className={styles.mainBodytag}>pwrmin@naver.com</div>
                <div className={styles.mainBodytag}>010-6784-3579</div>
                <div className={styles.mainBodytag}>마케팅1팀</div>
                <div className={styles.mainBodytag}>사원</div>

            </div>  {/* 주소록 바디 */}

        </div> {/* 메인 주소록창  */}

        {/* 오른쪽 주소록 바 */}
        <div className={styles.rightbar}>

            {/* 주소록 bar 헤더 */}
            <div className={styles.rightbarHeader}>
                {/* 주소록 추가 */}
                <button className={styles.createbtn} onClick={handleContactsAdd}> 주소록 추가 </button>
            </div>

            {/* 주소록 bar 바디 */}
            <div className={styles.rightbarBody}>

                {/* 주소록 종류 출력  */}
                <div className={styles.rightbarBodytag}> 디자인팀 </div>
                <div className={styles.rightbarBodytag}> 마케팅팀 </div>
                <div className={styles.rightbarBodytag}> 물류팀 </div>
                <div className={styles.rightbarBodytag}> 인사팀 </div>

            </div>

        </div>


    </div>








    );
}

export default Contacts;