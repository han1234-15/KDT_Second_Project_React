import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import { useState, useEffect, useCallback } from "react";
import styles from "./TipTapEditor.module.css";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  PictureOutlined,
  LinkOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BlockOutlined,
  CodeOutlined,
  HighlightOutlined,
  MinusOutlined,
  TableOutlined,
  CheckSquareOutlined,
  FontSizeOutlined,
  ScissorOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { InputNumber, Modal, Tooltip } from "antd";
import { caxios } from "../../config/config";

async function uploadImage(file, moduleType, moduleSeq) {
  if (!file) return;

  const formData = new FormData();
  formData.append("module_type", moduleType);
  formData.append("module_seq", moduleSeq);
  formData.append("files", file); // ✅ 하나만 보냄

  try {
    const resp = await caxios.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("업로드 성공:", resp.data);
    return resp.data; // FilesDTO (단일 객체)
  } catch (err) {
    console.error("파일 업로드 실패:", err);
    throw err;
  }
}


export default function TiptapEditor({ value = "", onChange, moduleType = "board", moduleSeq = 0 }) {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [activeState, setActiveState] = useState({});

  const editor = useEditor({
    extensions: [
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Heading.configure({ levels: [1, 2, 3] }),
      Blockquote,
      HorizontalRule,
      Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
      Highlight,
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: { attributes: { class: styles.editorContent } },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const updateActive = useCallback(() => {
    if (!editor) return;
    setActiveState({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      highlight: editor.isActive("highlight"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      taskList: editor.isActive("taskList"),
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      alignLeft: editor.isActive({ textAlign: "left" }),
      alignCenter: editor.isActive({ textAlign: "center" }),
      alignRight: editor.isActive({ textAlign: "right" }),
      blockquote: editor.isActive("blockquote"),
      codeBlock: editor.isActive("codeBlock"),
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    updateActive();
    editor.on("update", updateActive);
    editor.on("selectionUpdate", updateActive);
    return () => {
      editor.off("update", updateActive);
      editor.off("selectionUpdate", updateActive);
    };
  }, [editor, updateActive]);

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const uploaded = await uploadImage(file, moduleType, moduleSeq);
        const imageUrl = uploaded[0]?.sysname;
        console.log(uploaded);
        console.log(imageUrl);
        if (!imageUrl) {
          alert("이미지 URL을 찾을 수 없습니다.");
          return;
        }

        editor.chain().focus().setImage({ src: "https://storage.googleapis.com/yj_study/" + imageUrl }).run();
      } catch (err) {
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    };

    input.click();
  }, [editor, moduleType, moduleSeq]);

  const setLink = useCallback(() => {
    let url = prompt("링크 URL을 입력하세요 (예: https://example.com)");
    if (!url) return;

    // ✅ 입력값이 http(s)나 mailto로 시작하지 않으면 자동 보정
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      url = "https://" + url;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const unsetLink = useCallback(() => editor.chain().focus().unsetLink().run(), [editor]);

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setIsTableModalOpen(false);
  }, [editor, rows, cols]);

  const insertDivider = useCallback(() => editor.chain().focus().setHorizontalRule().run(), [editor]);

  if (!editor) return null;

  const Btn = ({ icon, onClick, active, title }) => (
    <Tooltip title={title}>
      <button
        type="button"
        onClick={() => {
          if (!editor) return;
          onClick?.();
          editor.chain().focus().run();
          setTimeout(updateActive, 0);
        }}
        className={`${styles.toolbarBtn} ${active ? styles.active : ""}`}
      >
        {icon}
      </button>
    </Tooltip>
  );

  return (
    <div className={styles.container}>
      <div className={styles.toolbarWrapper}>
        <div className={styles.toolbar}>
          {/* 서식 */}
          <Btn icon={<BoldOutlined />} title="굵게" active={activeState.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
          <Btn icon={<ItalicOutlined />} title="기울임" active={activeState.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <Btn icon={<UnderlineOutlined />} title="밑줄" active={activeState.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <Btn icon={<HighlightOutlined />} title="형광펜" active={activeState.highlight} onClick={() => editor.chain().focus().toggleHighlight().run()} />

          <div className={styles.divider}></div>

          {/* 제목 */}
          {[1, 2, 3].map((lvl) => (
            <Btn
              key={lvl}
              title={`Heading ${lvl}`}
              icon={<FontSizeOutlined />}
              active={activeState[`h${lvl}`]}
              onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()}
            />
          ))}

          <div className={styles.divider}></div>

          {/* 목록 */}
          <Btn icon={<UnorderedListOutlined />} title="글머리 기호" active={activeState.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <Btn icon={<OrderedListOutlined />} title="번호 목록" active={activeState.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} />


          <div className={styles.divider}></div>

          {/* 정렬 */}
          <Btn icon={<AlignLeftOutlined />} title="왼쪽 정렬" active={activeState.alignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
          <Btn icon={<AlignCenterOutlined />} title="가운데 정렬" active={activeState.alignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
          <Btn icon={<AlignRightOutlined />} title="오른쪽 정렬" active={activeState.alignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()} />

          <div className={styles.divider}></div>

          {/* 삽입 */}
          <Btn icon={<LinkOutlined />} title="링크 추가" onClick={setLink} />
          <Btn icon={<ScissorOutlined />} title="링크 제거" onClick={unsetLink} />
          <Btn icon={<PictureOutlined />} title="이미지" onClick={addImage} />
          <Btn icon={<BlockOutlined />} title="인용문" active={activeState.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <Btn icon={<CodeOutlined />} title="코드 블록" active={activeState.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
          <Btn icon={<MinusOutlined />} title="구분선" onClick={insertDivider} />

          {/* 테이블 */}
          <div className={styles.divider}></div>
          <Btn icon={<TableOutlined />} title="테이블 생성" onClick={() => setIsTableModalOpen(true)} />
          <Btn icon={<DeleteOutlined />} title="테이블 삭제" onClick={() => editor.chain().focus().deleteTable().run()} />
        </div>
      </div>

      <Modal
        open={isTableModalOpen}
        title="테이블 생성"
        onOk={insertTable}
        onCancel={() => setIsTableModalOpen(false)}
        width={260}
        styles={{ body: { padding: "12px 20px" } }}
      >
        <div className={styles.modalRow}>
          <span>행(Row)</span>
          <InputNumber min={1} max={20} value={rows} onChange={setRows} />
        </div>
        <div className={styles.modalRow}>
          <span>열(Col)</span>
          <InputNumber min={1} max={20} value={cols} onChange={setCols} />
        </div>
      </Modal>

      <EditorContent editor={editor} />
    </div>
  );
}