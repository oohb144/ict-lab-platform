import { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
import { TeamOutlined, ToolOutlined, FolderOpenOutlined, CommentOutlined, ExperimentOutlined, TrophyOutlined } from '@ant-design/icons';
import { getSiteContent } from '../api/admin';
import { getEquipment } from '../api/equipment';
import { getResources } from '../api/resources';
import { getPosts } from '../api/posts';

export default function Home() {
  const [content, setContent] = useState(null);
  const [stats, setStats] = useState({ members: 0, equipment: 0, resources: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSiteContent().then((r) => setContent(r.data)),
      getEquipment().then((r) => setStats((s) => ({ ...s, equipment: r.data.length }))),
      getResources().then((r) => setStats((s) => ({ ...s, resources: r.data.length }))),
      getPosts().then((r) => setStats((s) => ({ ...s, posts: r.data.length }))),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
        {content?.introTitle || '欢迎来到 ICT 实验室'}
      </h2>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        {content?.introSubtitle || '信息与通信工程学院创新创业实践基地'}
      </p>

      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col span={6}><Card><Statistic title="器材种类" value={stats.equipment} prefix={<ToolOutlined />} valueStyle={{ color: '#16a34a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="共享资料" value={stats.resources} prefix={<FolderOpenOutlined />} valueStyle={{ color: '#7c3aed' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="讨论帖数" value={stats.posts} prefix={<CommentOutlined />} valueStyle={{ color: '#ea580c' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="在册成员" value={stats.members} prefix={<TeamOutlined />} valueStyle={{ color: '#2563eb' }} /></Card></Col>
      </Row>

      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col span={12}>
          <Card style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 0, borderRadius: 12 }}>
            <ExperimentOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }} />
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>研究方向</h3>
            <p style={{ color: 'rgba(219,234,254,0.9)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              {content?.introBox1 || '嵌入式系统开发、机器视觉、5G无线通信技术、物联网应用开发。'}
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 0, borderRadius: 12 }}>
            <TrophyOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }} />
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>核心赛事</h3>
            <p style={{ color: 'rgba(237,233,254,0.9)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              {content?.introBox2 || '全国大学生嵌入式设计大赛、光电设计竞赛、大唐杯。'}
            </p>
          </Card>
        </Col>
      </Row>

      <Card title="入驻须知" style={{ borderRadius: 12 }}
        headStyle={{ fontWeight: 700, borderLeft: '4px solid #2563eb', paddingLeft: 12 }}>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#475569', fontSize: 14, lineHeight: 1.8, margin: 0, fontFamily: 'inherit' }}>
          {content?.introRules || '暂无内容'}
        </pre>
      </Card>
    </div>
  );
}
