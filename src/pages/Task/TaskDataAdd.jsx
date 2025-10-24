import styles from "./Task.module.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

//데이터 추가 페이지
const TaskDataAdd = ({ onClose }) => {


    // CKEditor 내용 변경 처리
    const handleEditorChange = (event, editor) => {
        const data = editor.getData();

    };

    //저장
    const handleAdd = () => {
        onClose();
    }

    //취소
    const handleOut = () => {
        onClose();
    }

    return (

        <div className={styles.container} style={{ width: "100%", height: "100%" }}>
            <div style={{ fontSize: "30px", marginLeft: "10px" }}>
                데이터 등록
            </div>
            <hr style={{ clear: "both", border: "1px solid black" }} />
            <div className={styles.mainHeader} style={{ fontSize: "30px" }}>

                <div style={{ width: "100%", float: "left" }}>
                    <input type="text" placeholder="제목을 입력해 주세요" style={{ border: "none", marginLeft: "10px" }} />
                </div>

            </div>
            <hr style={{ width: "50%", clear: "both", border: "1px solid black" }} />

            <div className={styles.mainBody}>

                {/* 왼쪽 */}
                {/* 에디터 api */}
                <div style={{ width: "50%", height: "100%", float: "left", fontSize: "15px" }}>
                    <CKEditor
                        editor={ClassicEditor}
                        data={''}
                        onChange={handleEditorChange}
                        config={{
                            toolbar: [
                                'heading', '|', 'bold', 'italic', 'underline', 'link',
                                'bulletedList', 'numberedList', '|', 'insertTable',
                                'blockQuote', 'undo', 'redo',
                            ]
                        }}
                    />

                </div>


                {/* 오른쪽 */}
                <div style={{ width: "50%", height: "100%", float: "left", fontSize: "20px" }}>

                    <div className={styles.NewSharedMailbox1}>그룹 이름 </div>
                    <select style={{ width: "20%", marginLeft: "10px" }}>
                        <option value="대기">대기</option>
                        <option value="진행">진행</option>
                        <option value="완료">완료</option>
                    </select>
                    <br></br>
                    <br></br>
                    <br></br>

                    <div className={styles.NewSharedMailbox1}>텍스트 </div>
                    <input type="text" className={styles.NewSharedMailbox2} placeholder="텍스트 입력"
                        style={{ textAlign: "left", verticalAlign: "top", color: "black", borderRadius: "5px", border: "1px solid grey" }} />
                    <br></br>
                    <br></br>
                    <br></br>

                    <div className={styles.NewSharedMailbox1} style={{ textAlign: "left" }}>파일 </div>
                    <input type="file"
                        style={{ color: "black", borderRadius: "5px", border: "none", cursor: "pointer" }} />
                    <br></br>
                    <br></br>
                    <br></br>

                    <div className={styles.NewSharedMailbox1}> 담당자 </div>
                    <div style={{ width: "70%", float: "left", border: "1px solid black" }}>
                        김이사 , 김상무 , 오차장 , 임과장 , 김부장 ,유팀장 <br></br>
                        조대리 , 임사원 , 지사원 ...
                    </div>

                    <br></br>

                    <button style={{ float: "right", marginLeft: "50px", marginRight: "50px", marginTop: "40%" }} onClick={handleAdd}>저장</button>
                    <button style={{ float: "right", marginTop: "40%" }} onClick={handleOut}>취소</button>
                </div>

            </div>

        </div>


    );
}

export default TaskDataAdd;