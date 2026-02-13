import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, App, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Report } from '../../../types/admin';
import { reportsApi } from '../../../api/client';

const { Title } = Typography;

export default function ReportsPage() {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      setData(await reportsApi.list());
    } catch {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await reportsApi.remove(id);
      message.success('Report dismissed');
      fetchData();
    } catch {
      message.error('Failed to dismiss report');
    }
  };

  const columns = [
    { title: 'User', dataIndex: 'user_name', key: 'user_name' },
    { title: 'Book', dataIndex: 'book_title', key: 'book_title' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Report) => (
        <Popconfirm title="Dismiss this report?" onConfirm={() => handleDelete(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Title level={4}>Reports</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </>
  );
}
