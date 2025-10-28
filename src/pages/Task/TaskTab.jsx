import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "./TaskTabs.module.css";


const TaskTab = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const mainTabs = [
          { label: "업무 그룹", path: "/task/group" },
        { label: "담당 업무", path: "/task/responsible" }
    ];

    const subTabs = [];

    return (
        <div className={styles.wrapper}>
            <div className={styles.headerRow}>
                {/* 왼쪽 탭 영역 */}
                <ContentTap
                    mainTabs={mainTabs}
                    subTabs={subTabs}
                    activePath={location.pathname}
                    onMainClick={(path) => navigate(path)}
                    onSubClick={(path) => navigate(path)}
                />

                {/* 오른쪽 버튼 영역 */}
                {location.pathname.startsWith("/board") && (
                    <button
                        className={styles.writeBtn}
                        onClick={() => navigate("/board/boardWrite")}
                    >
                        글 작성하기
                    </button>
                )}
            </div>

            {/* 실제 콘텐츠 출력 */}
            <Outlet />
        </div>
    );
};

export default TaskTab;
