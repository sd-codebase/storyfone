import { Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CrudPage from '../CrudPage';
import { authorsApi } from '../../../api/client';
import type { Author } from '../../../types/admin';

const columns: ColumnsType<Author> = [
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

export default function AuthorsPage() {
  return (
    <CrudPage<Author>
      title="Authors"
      api={authorsApi}
      columns={columns}
      formFields={formFields}
    />
  );
}
