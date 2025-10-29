import styles from "./Contacts.module.css";
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';

const Organization = () => {

    const [organization, setOrganization] = useState([]);
    const [openTeams, setOpenTeams] = useState({});
    const [selectedTeam, setSelectedTeam] = useState(null); // 선택된 팀

    const [checkedList, setCheckedList] = useState([]); // 체크 상태 관리 seq 아닌 id 기준
    const [allChecked, setAllChecked] = useState(false); // 전체 체크 상태 seq 아닌 id 기준

    const teams = [
        { name: "연구&개발" },
        { name: "사업관리팀" },
        { name: "AI센터", },
        { name: "인사관" },
        { name: "재무/회계" },
        { name: "마케팅팀" },

    ];

    // 조직도 리스트 출력
    const handleOrganizationList = () => {

        caxios.get("/contacts/organization", { withCredentials: true })
            .then(resp => {
                setOrganization(resp.data);
            });
    }

    // 페이지 로딩시 리스트 출력
    useEffect(() => {
        handleOrganizationList();
    }, []);

    // 전체 체크박스를 클릭하면(true) 아래 체크박스 전체 적용
    useEffect(() => {
        if (organization.length > 0 && checkedList.length === organization.length) {
            setAllChecked(true);
        } else {
            setAllChecked(false);
        }
    }, [checkedList, organization]);

    // 전체 체크박스 선택
    const handleAllcheckbox = () => {
        if (!allChecked) {
            // 모든 체크
            setCheckedList(organization.map(organization => organization.id));
            setAllChecked(true);
        } else {
            // 모두 해제
            setCheckedList([]);
            setAllChecked(false);
        }
    }

    // 개별 체크박스 선택
    const handleSingleCheck = (id) => {

        if (checkedList.includes(id)) {
            setCheckedList(checkedList.filter(item => item !== id));
        } else {
            setCheckedList([...checkedList, id]);
        }
    }


    // 공유 주소록으로 이동
    const handleContactsUpdateTypeMulti = async () => {
        await caxios.put("/contacts/orgType", { idList: checkedList, type: "multi" }, { withCredentials: true });

        setCheckedList([]);
        setAllChecked(false);
        handleOrganizationList();
    }

    // 개인 주소록으로 이동
    const handleContactsUpdateTypeSingle = async () => {
        caxios.put("/contacts/orgType", { idList: checkedList, type: "solo" }, { withCredentials: true });

        setCheckedList([]);
        setAllChecked(false);
        handleOrganizationList();
    }

    return (
        <div className={styles.container} style={{ height: "500px" }} >

            <div className={styles.mainHeader}>
                <div className={styles.mainHeadertop}>
                    조직도
                </div>
                <div className={styles.mainHeaderbottom} >
                    {checkedList.length === 0 ? (
                        <>

                        </>) : (
                        <>
                            <button onClick={handleContactsUpdateTypeSingle} style={{ margin: "10px" }}> 개인 주소록으로 </button>
                            <button onClick={handleContactsUpdateTypeMulti} style={{ margin: "10px" }}> 공용 주소록으로 </button>
                        </>
                    )}
                </div>

            </div>
            <div style={{ width: "100%", height: "100%", alignItems: "center" , marginTop:"30px" }}>



                <div style={{ width: "10%", height: "100%", float: "left", overflowY: "scroll", fontSize: "20px", textAlign: "center", backgroundColor: "lightgrey" }}>


                    {teams.map((team, i) => (
                        <div key={i} style={{ marginTop: "45px" }}>
                            <div
                                style={{ cursor: team.name.length > 0 }}
                                onClick={() => {

                                    if (team.name.length > 0) {
                                        setOpenTeams(prev => ({
                                            ...prev,
                                            [team.name]: !prev[team.name]

                                        }
                                        ));
                                    }
                                    setSelectedTeam(team.name)
                                }}
                            >
                                <a style={{ cursor: "pointer" }}> {team.name}</a>
                            </div>


                        </div>
                    ))}


                </div>


                <div style={{ width: "30%", height: "100%", float: "left", overflowY: "scroll", borderRight: "1px solid lightgrey", borderBottom: "1px solid lightgrey" }}>
                    <div className={styles.mainBodyHeader} >
                        <div className={styles.mainBodycheckbox}><input type="checkbox" onClick={handleAllcheckbox} /></div>
                        <div className={styles.mainBodytag}>부서</div>
                        <div className={styles.mainBodytag}>이름</div>
                        <div className={styles.mainBodytag}>직위</div>
                        <div className={styles.mainBodytag}>직무</div>
                        <div className={styles.mainBodytag}>재직여부</div>
                    </div>
                    {selectedTeam ? (
                        organization.filter(e => e.dept_code === selectedTeam) // 서버 데이터에서 팀명 필터링
                            .map(e => (
                                <div key={e.id} className={styles.mainBodylistbox}>
                                    <div className={styles.mainBodycheckbox}>
                                        <input type="checkbox" checked={checkedList.includes(e.id)} onChange={() => handleSingleCheck(e.id)} />
                                    </div>
                                    <div className={styles.mainBodytag}>{e.dept_code}</div>
                                    <div className={styles.mainBodytag}>{e.name}</div>
                                    <div className={styles.mainBodytag}>{e.rank_code}</div>
                                    <div className={styles.mainBodytag}>{e.job_code}</div>
                                    <div className={styles.mainBodytag}>{e.status}</div>
                                </div>
                            ))
                    ) : (
                        organization.map(e => (
                            <div key={e.id} className={styles.mainBodylistbox}>
                                <div className={styles.mainBodycheckbox}>
                                    <input type="checkbox" checked={checkedList.includes(e.id)} onChange={() => handleSingleCheck(e.id)} />
                                </div>
                                <div className={styles.mainBodytag}>{e.dept_code}</div>
                                <div className={styles.mainBodytag}>{e.name}</div>
                                <div className={styles.mainBodytag}>{e.rank_code}</div>
                                <div className={styles.mainBodytag}>{e.job_code}</div>
                                <div className={styles.mainBodytag}>{e.status}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div >



    );

}

export default Organization;