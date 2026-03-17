import { useEffect, useState, useRef, useMemo } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  message,
  Spin,
  Popconfirm,
  Segmented,
  Row,
  Col,
  Upload,
  Alert,
  Drawer,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  FormOutlined,
  PictureOutlined,
  FilePdfOutlined,
  FileMarkdownOutlined,
  FolderOpenOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { getTutorials, createTutorial, deleteTutorial } from "../api/tutorials";
import { uploadFile, getProxyUrl } from "../api/resources";
import { formatTime } from "../utils/formatTime";
import useAuthStore from "../store/useAuthStore";

/* ─── helpers ─────────────────────────────────────────────────────── */

/** Convert heading text → a stable DOM id */
const slugify = (text) =>
  String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .substring(0, 80) || "heading";

/** Strip markdown syntax from a raw heading line */
const stripMd = (t) =>
  t
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

/**
 * Parse all headings from markdown source.
 * Returns [{level, text, id}] where id is "{slug}-{occurrence-index}".
 */
function parseHeadings(markdown) {
  if (!markdown) return [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const counts = {};
  const result = [];
  let m;
  while ((m = regex.exec(markdown)) !== null) {
    const level = m[1].length;
    const text = stripMd(m[2]);
    const base = slugify(text);
    const n = counts[base] ?? 0;
    counts[base] = n + 1;
    result.push({ level, text, id: n === 0 ? base : `${base}-${n}` });
  }
  return result;
}

/* ─── TOC sidebar ─────────────────────────────────────────────────── */

/**
 * A sticky table-of-contents panel.
 *
 * Scroll-tracking works by listening to the nearest *scrollable ancestor*
 * (Ant Design Layout sets overflow:auto on .ant-layout-content) instead of
 * the window, which is what makes the IntersectionObserver approach unreliable
 * in a nested-scroll layout.
 */
function TocPanel({ headings, onClose }) {
  const [active, setActive] = useState("");

  /* find the scroll container once on mount */
  useEffect(() => {
    const scroller = document.querySelector(".ant-layout-content") || window;

    const onScroll = () => {
      const scrollTop =
        scroller === window ? window.scrollY : scroller.scrollTop;
      let current = headings[0]?.id ?? "";
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top =
          scroller === window
            ? el.getBoundingClientRect().top + window.scrollY
            : el.offsetTop;
        if (top - scrollTop <= 120) current = id;
        else break;
      }
      setActive(current);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial active
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [headings]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const scroller = document.querySelector(".ant-layout-content") || window;
    if (scroller === window) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      scroller.scrollTo({
        top: el.offsetTop - 72,
        behavior: "smooth",
      });
    }
    setActive(id);
    onClose?.(); // close drawer on mobile after click
  };

  if (headings.length === 0) return null;

  return (
    <div style={{ padding: "10px 0" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 10,
          paddingLeft: 14,
        }}
      >
        目 录
      </div>
      {headings.map(({ level, text, id }) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => handleClick(e, id)}
            title={text}
            style={{
              display: "block",
              padding: `4px 14px 4px ${10 + (level - 1) * 14}px`,
              fontSize: level <= 2 ? 12.5 : 12,
              fontWeight: level <= 2 ? 600 : 400,
              color: isActive ? "#5b8af5" : "#64748b",
              background: isActive ? "rgba(91,138,245,.08)" : "transparent",
              borderLeft: `2px solid ${isActive ? "#5b8af5" : "transparent"}`,
              borderRadius: "0 4px 4px 0",
              textDecoration: "none",
              transition: "all .15s",
              lineHeight: 1.55,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {text}
          </a>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Tutorials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState("编辑");
  const [importing, setImporting] = useState(false);
  const [pendingImgCount, setPendingImgCount] = useState(0);
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const imgInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const pendingMdText = useRef("");

  /* ── Build TOC items from whichever content is active ─────────── */
  const tocItems = useMemo(
    () => parseHeadings(viewing ? viewing.content : content),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewing?.content, content],
  );

  /* ── Heading ID counter (index-based, stable, no dedup issues) ── */
  const headingIdxRef = useRef(0);

  /**
   * We reset the counter RIGHT BEFORE ReactMarkdown renders by putting this
   * inside the same render cycle.  Each heading component increments it so
   * the i-th heading in the DOM gets id = tocItems[i].id, matching the TOC.
   */
  const makeHeading = (level) =>
    function HeadingComp({ children }) {
      const idx = headingIdxRef.current++;
      const id = tocItems[idx]?.id ?? `h-${idx}`;
      const Tag = `h${level}`;
      return <Tag id={id}>{children}</Tag>;
    };

  /* ── ReactMarkdown component map ─────────────────────────────── */
  const markdownComponents = useMemo(
    () => ({
      /* headings: inject stable IDs */
      h1: makeHeading(1),
      h2: makeHeading(2),
      h3: makeHeading(3),
      h4: makeHeading(4),
      h5: makeHeading(5),
      h6: makeHeading(6),

      /* ── table: wrapper div fixes border-radius in all browsers ── */
      table({ children }) {
        return (
          <div
            style={{
              overflowX: "auto",
              margin: "16px 0",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9em",
              }}
            >
              {children}
            </table>
          </div>
        );
      },

      thead({ children }) {
        return (
          <thead
            style={{ background: "rgba(91,138,245,.1)", userSelect: "none" }}
          >
            {children}
          </thead>
        );
      },

      tbody({ children }) {
        return <tbody>{children}</tbody>;
      },

      tr({ children }) {
        return (
          <tr
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(91,138,245,.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            {children}
          </tr>
        );
      },

      th({ children }) {
        return (
          <th
            style={{
              padding: "8px 14px",
              textAlign: "left",
              fontWeight: 700,
              color: "#5b8af5",
              borderBottom: "2px solid #e2e8f0",
              borderRight: "1px solid #e2e8f0",
              whiteSpace: "nowrap",
              fontSize: "0.88em",
            }}
          >
            {children}
          </th>
        );
      },

      td({ children }) {
        return (
          <td
            style={{
              padding: "7px 14px",
              borderBottom: "1px solid #f1f5f9",
              borderRight: "1px solid #f1f5f9",
              color: "#334155",
              lineHeight: 1.6,
              verticalAlign: "top",
            }}
          >
            {children}
          </td>
        );
      },

      /* ── images: proxy Gitee links ── */
      img({ src, alt }) {
        const displaySrc = src?.includes("gitee.com") ? getProxyUrl(src) : src;
        return (
          <img
            src={displaySrc}
            alt={alt ?? ""}
            style={{
              maxWidth: "100%",
              borderRadius: 8,
              margin: "14px 0",
              display: "block",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
            onError={(e) => {
              if (e.target.dataset.fallback !== "1") {
                e.target.dataset.fallback = "1";
                e.target.src = src;
              }
            }}
          />
        );
      },

      /* ── links: special PDF treatment ── */
      a({ href, children }) {
        if (href?.match(/\.pdf(\?|$)/i)) {
          return (
            <div
              style={{
                margin: "12px 0",
                padding: "12px 16px",
                background: "#fef2f2",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FilePdfOutlined style={{ fontSize: 20, color: "#ef4444" }} />
                <span style={{ color: "#334155", fontSize: 14 }}>
                  {children}
                </span>
              </span>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#4096ff", fontSize: 13, whiteSpace: "nowrap" }}
              >
                下载 PDF
              </a>
            </div>
          );
        }
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      },

      /* ── custom <pdf-preview> tag ── */
      "pdf-preview"({ src, title: pdfTitle }) {
        return (
          <div
            style={{
              margin: "12px 0",
              padding: "12px 16px",
              background: "#fef2f2",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FilePdfOutlined style={{ fontSize: 20, color: "#ef4444" }} />
              <span style={{ color: "#334155", fontSize: 14 }}>
                {pdfTitle || "PDF 文件"}
              </span>
            </span>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#4096ff", fontSize: 13, whiteSpace: "nowrap" }}
            >
              下载 PDF
            </a>
          </div>
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tocItems],
  );

  const remarkPlugins = [remarkGfm];
  const rehypePlugins = [rehypeRaw, rehypeHighlight];

  /* ── Data ──────────────────────────────────────────────────────── */
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getTutorials();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ── CRUD ──────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!title.trim()) return message.error("标题不能为空");
    if (!content.trim()) return message.error("内容不能为空");
    try {
      await createTutorial({ title, content });
      message.success("发布成功");
      closeModal();
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "发布失败");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTutorial(id);
      message.success("已删除");
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "删除失败");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setTitle("");
    setContent("");
    setPreviewMode("编辑");
    setPendingImgCount(0);
    pendingMdText.current = "";
  };

  /* ── Image / file import ───────────────────────────────────────── */
  const handleImageUpload = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await uploadFile(fd);
      const url = data.url || data.fileUrl;
      setContent((prev) => prev + `![${file.name}](${url})\n`);
      message.success("图片上传成功");
    } catch (err) {
      message.error(err.response?.data?.message || "图片上传失败");
    }
    return false;
  };

  const handleImportMd = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let mdText = e.target.result.replace(
        /(!\[.*?\]\()([^)]+)\)/g,
        (_, prefix, path) => prefix + path.replace(/\\/g, "/") + ")",
      );
      const locals = mdText.match(/!\[.*?\]\((?!https?:\/\/)([^)]+)\)/g);
      if (locals?.length) {
        pendingMdText.current = mdText;
        if (!title.trim()) setTitle(file.name.replace(/\.md$/i, ""));
        setPendingImgCount(locals.length);
        message.info(
          `检测到 ${locals.length} 张本地图片，请在下方上传对应图片`,
        );
      } else {
        setContent(mdText);
        if (!title.trim()) setTitle(file.name.replace(/\.md$/i, ""));
        message.success("Markdown 文件已导入");
      }
    };
    reader.readAsText(file, "utf-8");
    return false;
  };

  const handleBatchImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !pendingMdText.current) return;
    setImporting(true);
    let mdText = pendingMdText.current;
    let ok = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { data } = await uploadFile(fd);
        const url = data.url || data.fileUrl;
        const nameNoExt = file.name.replace(/\.[^.]+$/, "");
        const esc = nameNoExt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(!\\[.*?\\])\\(([^)]*${esc}[^)]*?)\\)`, "g");
        mdText = mdText.replace(re, `$1(${url})`);
        ok++;
      } catch {
        message.error(`图片 ${file.name} 上传失败`);
      }
    }
    setContent(mdText);
    pendingMdText.current = "";
    setImporting(false);
    setPendingImgCount(0);
    message.success(`已导入，${ok}/${files.length} 张图片上传成功`);
    e.target.value = "";
  };

  const handleImportPdf = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await uploadFile(fd);
      const url = data.url || data.fileUrl;
      setContent(
        (prev) => prev + `<pdf-preview src="${url}" title="${file.name}" />\n`,
      );
      if (!title.trim()) setTitle(file.name.replace(/\.pdf$/i, ""));
      message.success("PDF 已上传，链接已插入");
    } catch (err) {
      message.error(err.response?.data?.message || "PDF 上传失败");
    }
    return false;
  };

  /* ── Loading state ─────────────────────────────────────────────── */
  if (loading)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════
     READING VIEW
  ═══════════════════════════════════════════════════════════════ */
  if (viewing) {
    const canDel = user?.role === "admin" || viewing.authorId === user?.id;
    const hasToc = tocItems.length > 0;

    /* reset heading render counter before every render pass */
    headingIdxRef.current = 0;

    return (
      <div style={{ padding: "24px 32px" }}>
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setViewing(null)}
            style={{ color: "#64748b" }}
          >
            返回列表
          </Button>
          {hasToc && (
            <Button
              type="text"
              icon={<UnorderedListOutlined />}
              onClick={() => setTocDrawerOpen(true)}
              style={{ color: "#64748b" }}
            >
              目录
            </Button>
          )}
        </div>

        {/* ── Title + meta ── */}
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: 6,
          }}
        >
          {viewing.title}
        </h2>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
          <UserOutlined /> {viewing.author?.name} ·{" "}
          {formatTime(viewing.createdAt)}
          {canDel && (
            <Popconfirm
              title="确定删除这篇教程？"
              onConfirm={() => {
                handleDelete(viewing.id);
                setViewing(null);
              }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ marginLeft: 12 }}
              />
            </Popconfirm>
          )}
        </div>

        {/* ── Two-column: article + TOC ── */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* Article */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card style={{ borderRadius: 12 }}>
              <div
                className="markdown-body"
                style={{ lineHeight: 1.85, color: "#334155" }}
              >
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                  components={markdownComponents}
                >
                  {viewing.content}
                </ReactMarkdown>
              </div>
            </Card>
          </div>

          {/* TOC sidebar (desktop, hidden below 1024 px via inline style) */}
          {hasToc && (
            <div
              style={{
                width: 220,
                flexShrink: 0,
                position: "sticky",
                top: 24,
              }}
            >
              <Card
                style={{
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  maxHeight: "calc(100vh - 120px)",
                  overflowY: "auto",
                }}
                bodyStyle={{ padding: "6px 0" }}
              >
                <TocPanel headings={tocItems} />
              </Card>
            </div>
          )}
        </div>

        {/* TOC Drawer (mobile trigger from top-bar button) */}
        <Drawer
          title="文章目录"
          placement="right"
          open={tocDrawerOpen}
          onClose={() => setTocDrawerOpen(false)}
          width={260}
        >
          <TocPanel
            headings={tocItems}
            onClose={() => setTocDrawerOpen(false)}
          />
        </Drawer>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     LIST VIEW
  ═══════════════════════════════════════════════════════════════ */
  /* reset heading render counter in list/preview mode too */
  headingIdxRef.current = 0;

  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1e293b",
            margin: 0,
          }}
        >
          教程笔记
        </h2>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setModalOpen(true)}
        >
          发布笔记
        </Button>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: 48 }}>
          暂无教程笔记，快来发布第一篇吧
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {list.map((t) => {
            const canDel = user?.role === "admin" || t.authorId === user?.id;
            const summary =
              t.content.length > 100
                ? t.content.substring(0, 100) + "..."
                : t.content;
            return (
              <Col xs={24} md={12} lg={8} key={t.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 12 }}
                  onClick={() => setViewing(t)}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#1e293b",
                      marginBottom: 8,
                    }}
                  >
                    {t.title}
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                      marginBottom: 12,
                      minHeight: 40,
                    }}
                  >
                    {summary}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: 12,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      <UserOutlined /> {t.author?.name} ·{" "}
                      {formatTime(t.createdAt)}
                    </span>
                    {canDel && (
                      <Popconfirm
                        title="确定删除？"
                        onConfirm={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        onCancel={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* ── Hidden file inputs ── */}
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleBatchImages}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="image/*"
        multiple
        // @ts-ignore
        webkitdirectory=""
        style={{ display: "none" }}
        onChange={handleBatchImages}
      />

      {/* ═══ Publish Modal ════════════════════════════════════════ */}
      <Modal
        title="发布教程笔记"
        open={modalOpen}
        onOk={handleSubmit}
        width={760}
        confirmLoading={importing}
        onCancel={closeModal}
        okText="发布"
      >
        <Input
          placeholder="教程标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Segmented
            options={[
              {
                label: (
                  <span>
                    <FormOutlined /> 编辑
                  </span>
                ),
                value: "编辑",
              },
              {
                label: (
                  <span>
                    <EyeOutlined /> 预览
                  </span>
                ),
                value: "预览",
              },
            ]}
            value={previewMode}
            onChange={setPreviewMode}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Upload
              accept=".md"
              showUploadList={false}
              beforeUpload={handleImportMd}
            >
              <Button size="small" icon={<FileMarkdownOutlined />}>
                导入 MD
              </Button>
            </Upload>
            <Upload
              accept=".pdf"
              showUploadList={false}
              beforeUpload={handleImportPdf}
            >
              <Button size="small" icon={<FilePdfOutlined />}>
                导入 PDF
              </Button>
            </Upload>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
            >
              <Button size="small" icon={<PictureOutlined />}>
                插入图片
              </Button>
            </Upload>
          </div>
        </div>

        {/* Pending images banner */}
        {pendingImgCount > 0 && !importing && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12, borderRadius: 8 }}
            message={
              <span>
                检测到 <strong>{pendingImgCount}</strong>{" "}
                张本地图片，请选择对应图片文件或图片文件夹进行上传
              </span>
            }
            action={
              <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<PictureOutlined />}
                  onClick={() => imgInputRef.current?.click()}
                >
                  选择图片文件
                </Button>
                <Button
                  size="small"
                  icon={<FolderOpenOutlined />}
                  onClick={() => folderInputRef.current?.click()}
                >
                  选择图片文件夹
                </Button>
              </div>
            }
          />
        )}

        {/* Uploading spinner */}
        {importing && (
          <div
            style={{
              textAlign: "center",
              padding: "8px 0",
              color: "#4096ff",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            <Spin size="small" style={{ marginRight: 8 }} />
            正在上传图片并替换路径，请稍候...
          </div>
        )}

        {/* Edit / Preview area */}
        {previewMode === "编辑" ? (
          <Input.TextArea
            rows={14}
            placeholder="请输入 Markdown 格式的教程内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <Card style={{ minHeight: 320, borderRadius: 8 }}>
            <div
              className="markdown-body"
              style={{ lineHeight: 1.85, color: "#334155" }}
            >
              {content ? (
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <span style={{ color: "#94a3b8" }}>暂无内容</span>
              )}
            </div>
          </Card>
        )}
      </Modal>
    </div>
  );
}
