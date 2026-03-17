import { Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';

export default function Office() {
  return (
    <div style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>办公室工位规划</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>查看实验室物理空间与工位分配</p>
        </div>
        <Button icon={<FullscreenOutlined />} onClick={() => window.open('/办公室工位规划图.html', '_blank')}>
          全屏打开
        </Button>
      </div>
      <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', minHeight: 500 }}>
        <iframe src="/办公室工位规划图.html" title="工位规划图"
          style={{ width: '100%', height: '100%', border: 0, minHeight: 500 }} />
      </div>
    </div>
  );
}
