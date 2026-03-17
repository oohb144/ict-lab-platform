import { useEffect, useState } from "react";
import { Button, Tag, Spin, Alert } from "antd";
import {
  FullscreenOutlined,
  LockOutlined,
  UnlockOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { getSiteContent } from "../api/admin";
import useAuthStore from "../store/useAuthStore";

export default function Office() {
  const [seatUserEditable, setSeatUserEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    getSiteContent()
      .then(({ data }) => {
        setSeatUserEditable(data.seatUserEditable !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const canEdit = isAdmin || seatUserEditable;

  return (
    <div
      style={{
        padding: 32,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#1e293b",
                margin: 0,
              }}
            >
              办公室工位规划
            </h2>
            {!loading && (
              <Tag
                icon={canEdit ? <UnlockOutlined /> : <LockOutlined />}
                color={canEdit ? "green" : "default"}
                style={{ fontSize: 12 }}
              >
                {canEdit ? "可操作" : "仅浏览"}
              </Tag>
            )}
            {!loading && isAdmin && (
              <Tag
                icon={<EnvironmentOutlined />}
                color="blue"
                style={{ fontSize: 12 }}
              >
                管理员
              </Tag>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            查看实验室物理空间与工位分配
          </p>
        </div>
        <Button
          icon={<FullscreenOutlined />}
          onClick={() => window.open("/办公室工位规划图.html", "_blank")}
        >
          全屏打开
        </Button>
      </div>

      {/* ── Permission notice ── */}
      {!loading && !canEdit && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          style={{ marginBottom: 16, borderRadius: 8 }}
          message="当前工位图处于只读模式"
          description="管理员已限制普通成员修改工位信息，如需调整请联系管理员。"
        />
      )}
      {!loading && canEdit && !isAdmin && (
        <Alert
          type="success"
          showIcon
          icon={<UnlockOutlined />}
          style={{ marginBottom: 16, borderRadius: 8 }}
          message="工位可操作"
          description="你可以在下方规划图中标记或修改自己的工位信息。"
          closable
        />
      )}

      {/* ── Iframe ── */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            minHeight: 500,
            position: "relative",
          }}
        >
          <iframe
            src="/办公室工位规划图.html"
            title="工位规划图"
            style={{ width: "100%", height: "100%", border: 0, minHeight: 500 }}
          />
          {/* Read-only overlay when not allowed to edit */}
          {!canEdit && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "rgba(248,250,252,0.15)",
                zIndex: 10,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
