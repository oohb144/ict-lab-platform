import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Switch,
  Tabs,
  Table,
  Modal,
  Tag,
  Popconfirm,
  Space,
  Badge,
} from "antd";
import {
  SaveOutlined,
  BellOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  getSiteContent,
  updateSiteContent,
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from "../../api/admin";

/* ═══════════════════════════════════════════════════════════════════
   Tab 1 — Homepage content editor
═══════════════════════════════════════════════════════════════════ */
function ContentTab() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteContent()
      .then(({ data }) => {
        form.setFieldsValue({
          introTitle: data.introTitle,
          introSubtitle: data.introSubtitle,
          introBox1: data.introBox1,
          introBox2: data.introBox2,
          introRules: data.introRules,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await updateSiteContent(values);
      message.success("网页内容已保存");
    } catch (err) {
      message.error(err.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <Spin />
      </div>
    );

  return (
    <div style={{ maxWidth: 720 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          保存所有修改
        </Button>
      </div>
      <Form form={form} layout="vertical">
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introTitle" label="主页标题">
            <Input placeholder="主页标题" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introSubtitle" label="副标题">
            <Input placeholder="副标题" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introBox1" label="研究方向介绍">
            <Input.TextArea rows={3} placeholder="研究方向介绍" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introBox2" label="核心赛事介绍">
            <Input.TextArea rows={3} placeholder="核心赛事介绍" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12 }}>
          <Form.Item name="introRules" label="入驻须知">
            <Input.TextArea rows={6} placeholder="入驻须知" />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Tab 2 — Popup notification manager
═══════════════════════════════════════════════════════════════════ */
function NotificationsTab() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllNotifications();
      setNotices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      enabled: record.enabled,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updateNotification(editing.id, values);
        message.success("通知已更新");
      } else {
        await createNotification(values);
        message.success("通知已创建");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      message.success("通知已删除");
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "删除失败");
    }
  };

  const handleToggleEnabled = async (record) => {
    try {
      await updateNotification(record.id, {
        title: record.title,
        content: record.content,
        enabled: !record.enabled,
      });
      message.success(record.enabled ? "通知已禁用" : "通知已启用");
      load();
    } catch (err) {
      message.error("操作失败");
    }
  };

  const columns = [
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      width: 80,
      render: (v) =>
        v ? (
          <Badge
            status="processing"
            text={<span style={{ color: "#16a34a", fontSize: 12 }}>启用</span>}
          />
        ) : (
          <Badge
            status="default"
            text={<span style={{ color: "#94a3b8", fontSize: 12 }}>禁用</span>}
          />
        ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (t, r) => (
        <span
          style={{ fontWeight: 600, color: r.enabled ? "#1e293b" : "#94a3b8" }}
        >
          {t}
        </span>
      ),
    },
    {
      title: "内容预览",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (t) => (
        <span style={{ color: "#64748b", fontSize: 13 }}>
          {t.length > 60 ? t.substring(0, 60) + "…" : t}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      align: "right",
      width: 220,
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={r.enabled ? <StopOutlined /> : <CheckCircleOutlined />}
            style={{ color: r.enabled ? "#f59e0b" : "#16a34a" }}
            onClick={() => handleToggleEnabled(r)}
          >
            {r.enabled ? "禁用" : "启用"}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(r)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定删除通知「${r.title}」？`}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
          启用的通知将在用户首次打开主页时以弹窗形式展示（每条通知每次会话只弹一次）
        </p>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建通知
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={notices}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ background: "#fff", borderRadius: 12 }}
        locale={{ emptyText: "暂无通知，点击右上角新建" }}
      />

      <Modal
        title={editing ? "编辑通知" : "新建弹窗通知"}
        open={modalOpen}
        onOk={handleSave}
        confirmLoading={saving}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText={editing ? "保存修改" : "创建"}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="title"
            label="通知标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input
              placeholder="例如：实验室停电通知"
              maxLength={80}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="通知内容"
            rules={[{ required: true, message: "请输入内容" }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="支持换行，将以弹窗形式展示给所有用户"
              maxLength={1000}
              showCount
            />
          </Form.Item>
          <Form.Item name="enabled" label="立即启用" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Tab 3 — Workstation seat permission
═══════════════════════════════════════════════════════════════════ */
function SeatConfigTab() {
  const [seatUserEditable, setSeatUserEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteContent()
      .then(({ data }) => {
        setSeatUserEditable(data.seatUserEditable !== false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteContent({ seatUserEditable });
      message.success("工位配置已保存");
    } catch (err) {
      message.error(err.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <Spin />
      </div>
    );

  return (
    <div style={{ maxWidth: 560 }}>
      <Card
        style={{ borderRadius: 12, marginBottom: 16 }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(37,99,235,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <EnvironmentOutlined style={{ fontSize: 20, color: "#2563eb" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#1e293b",
                marginBottom: 4,
              }}
            >
              普通成员工位操作权限
            </div>
            <div
              style={{
                color: "#64748b",
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              开启后，普通成员可以在工位规划图中标记/修改自己的工位信息；
              关闭后仅管理员可操作，普通成员只读浏览。
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Switch
                checked={seatUserEditable}
                onChange={setSeatUserEditable}
                checkedChildren="允许操作"
                unCheckedChildren="仅管理员"
              />
              <Tag color={seatUserEditable ? "green" : "default"}>
                {seatUserEditable
                  ? "当前：普通成员可操作"
                  : "当前：仅管理员可操作"}
              </Tag>
            </div>
          </div>
        </div>
      </Card>

      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={saving}
        onClick={handleSave}
      >
        保存工位配置
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════ */
export default function ContentEdit() {
  const tabItems = [
    {
      key: "content",
      label: (
        <span>
          <HomeOutlined /> 首页内容
        </span>
      ),
      children: <ContentTab />,
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined /> 弹窗通知
        </span>
      ),
      children: <NotificationsTab />,
    },
    {
      key: "seat",
      label: (
        <span>
          <EnvironmentOutlined /> 工位配置
        </span>
      ),
      children: <SeatConfigTab />,
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 }}
        >
          内容与配置管理
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          在线修改首页内容、管理弹窗通知、配置工位权限
        </p>
      </div>
      <Tabs
        defaultActiveKey="content"
        items={tabItems}
        style={{ background: "#fff", borderRadius: 12, padding: "16px 24px" }}
      />
    </div>
  );
}
