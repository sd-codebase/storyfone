import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Modal, Popconfirm, Space, Table, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

export interface CrudApi<T> {
  list: () => Promise<T[]>;
  create: (body: Record<string, unknown>) => Promise<T>;
  update: (id: string, body: Record<string, unknown>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

interface CrudPageProps<T extends { id: string }> {
  title: string;
  api: CrudApi<T>;
  columns: ColumnsType<T>;
  formFields: React.ReactNode;
  extraActions?: (record: T, refresh: () => void) => React.ReactNode;
  canDelete?: (record: T) => boolean | string;
}

export default function CrudPage<T extends { id: string }>({
  title,
  api,
  columns,
  formFields,
  extraActions,
  canDelete,
}: CrudPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form] = Form.useForm();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.list());
    } catch {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: T) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await api.update(editing.id, values);
        message.success('Updated');
      } else {
        await api.create(values);
        message.success('Created');
      }
      setModalOpen(false);
      form.resetFields();
      refresh();
    } catch {
      // validation error or API error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.remove(id);
      message.success('Deleted');
      refresh();
    } catch {
      message.error('Failed to delete');
    }
  };

  const actionColumn: ColumnsType<T> = [
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => {
        const deleteCheck = canDelete ? canDelete(record) : true;
        const deleteAllowed = deleteCheck === true;
        const deleteTooltip = typeof deleteCheck === 'string' ? deleteCheck : undefined;
        return (
          <Space size="small">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
            {deleteAllowed ? (
              <Popconfirm title="Are you sure you want to delete?" onConfirm={() => handleDelete(record.id)}>
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            ) : (
              <Tooltip title={deleteTooltip}>
                <Button icon={<DeleteOutlined />} size="small" danger disabled />
              </Tooltip>
            )}
            {extraActions?.(record, refresh)}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add {title.replace(/s$/, '')}
        </Button>
      </div>
      <Table<T>
        rowKey="id"
        dataSource={data}
        columns={[...columns, ...actionColumn]}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="middle"
      />
      <Modal
        title={editing ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          {formFields}
        </Form>
      </Modal>
    </div>
  );
}
