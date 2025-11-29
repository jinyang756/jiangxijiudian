// src/AdminPanelDemo.tsx
import AdminPanelFiles from './components/AdminPanelFiles';

export default function AdminPanelDemo() {
  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Panel Files Demo</h1>
      <p>展示 admin-panel bucket 中的公开文件</p>
      <AdminPanelFiles bucket="admin-panel" prefix="" />
    </div>
  );
}