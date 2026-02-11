import { Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CrudPage from '../CrudPage';
import { narratorsApi } from '../../../api/client';
import type { Narrator } from '../../../types/admin';

const columns: ColumnsType<Narrator> = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Bio', dataIndex: 'bio', key: 'bio', ellipsis: true },
];

const formFields = (
  <>
    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
      <Input />
    </Form.Item>
    <Form.Item name="bio" label="Bio">
      <Input.TextArea rows={3} />
    </Form.Item>
  </>
);

export default function NarratorsPage() {
  return (
    <CrudPage<Narrator>
      title="Narrators"
      api={narratorsApi}
      columns={columns}
      formFields={formFields}
    />
  );
}
