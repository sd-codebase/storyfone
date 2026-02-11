import { Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import CrudPage from '../CrudPage';
import { languagesApi } from '../../../api/client';
import type { Language } from '../../../types/admin';

const columns: ColumnsType<Language> = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    render: (v: string) => dayjs(v).format('DD MMM YYYY, hh:mm A'),
  },
];

const formFields = (
  <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
    <Input />
  </Form.Item>
);

export default function LanguagesPage() {
  return (
    <CrudPage<Language>
      title="Languages"
      api={languagesApi}
      columns={columns}
      formFields={formFields}
    />
  );
}
