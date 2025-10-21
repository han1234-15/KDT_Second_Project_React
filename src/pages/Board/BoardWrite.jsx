import React, { useState } from "react";
import { Select, Input } from "antd";
import styles from "./BoardWrite.module.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const { Option } = Select;

const BoardWrite = () => {
  const [category, setCategory] = useState("a1");
  const [content, setContent] = useState("");

  const handleCategoryChange = (val) => {
    console.log("선택된 값:", val);
    setCategory(val);
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setContent(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.btns}>
        <button>확인</button>
        <button>임시저장</button>
      </div>
      <div className={styles.boardGroup}>게시판

        <div style={{ width: 240, marginTop: 10 }}>
          <Select
            value={category}
            onChange={handleCategoryChange}
            style={{ width: "100%" }}
            placeholder="옵션을 선택하세요"
          >
            <Option value="a1">자유게시판</Option>
            <Option value="b1">익명게시판</Option>
            <Option value="c1">자료실</Option>
          </Select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div>제목</div>
        <Input style={{ width: "500px" }} placeholder="제목을 입력하세요" />
      </div>

      <div className={styles.file}>
        <div>
          파일 첨부
          <button>+</button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={handleEditorChange}
          config={{
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "insertTable",
              "blockQuote",
              "undo",
              "redo",
            ],
          }}
        />
      </div>
    </div>
  );
};

export default BoardWrite;
