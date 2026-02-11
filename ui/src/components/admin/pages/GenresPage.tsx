import { Form, Input, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CrudPage from '../CrudPage';
import { genresApi } from '../../../api/client';
import type { Genre } from '../../../types/admin';

const columns: ColumnsType<Genre> = [
  {
    title: 'Name',
    key: 'name',
    render: (_, r) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <img src={`/genres/${r.name.replace(/ /g, '-')}.svg`} width={28} height={28} alt={r.name} style={{ borderRadius: 4 }} />
        {r.name}
        {r.is_adult && (
          <span style={{ background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 4, lineHeight: '18px' }}>
            18+
          </span>
        )}
      </span>
    ),
  },
];

const formFields = (
  <>
    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
      <Input />
    </Form.Item>
    <Form.Item name="icon" label="Icon (image URL)">
      <Input placeholder="https://example.com/icon.png" />
    </Form.Item>
    <Form.Item name="is_adult" label="Adult content" valuePropName="checked">
      <Switch />
    </Form.Item>
  </>
);

export default function GenresPage() {
  return (
    <CrudPage<Genre>
      title="Genres"
      api={genresApi}
      columns={columns}
      formFields={formFields}
    />
  );
}
