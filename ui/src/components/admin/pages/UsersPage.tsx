import { Button, DatePicker, Form, Input, Select, Switch, Tag, Tooltip, message } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import CrudPage from '../CrudPage';
import { usersApi, generateOtp } from '../../../api/client';
import type { AppUser } from '../../../types/admin';
import { UserPlan, UserStatus } from '../../../types/admin';

function calcAge(birthdate: string | null): string {
  if (!birthdate) return '—';
  const diff = Date.now() - new Date(birthdate).getTime();
  return String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
}

const statusColors: Record<string, string> = {
  active: 'green',
  disabled: 'orange',
  deleted: 'red',
};

const columns: ColumnsType<AppUser> = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'WhatsApp', dataIndex: 'whatsapp_number', key: 'whatsapp_number', width: 140 },
  {
    title: 'Age',
    key: 'age',
    width: 60,
    render: (_, r) => calcAge(r.birthdate),
  },
  {
    title: 'Plan',
    dataIndex: 'plan',
    key: 'plan',
    width: 80,
  },
  {
    title: 'Verified',
    dataIndex: 'is_verified',
    key: 'is_verified',
    width: 80,
    render: (v: boolean) => (v ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (v: string) => <Tag color={statusColors[v] ?? 'default'}>{v}</Tag>,
  },
];

const formFields = (
  <>
    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
      <Input />
    </Form.Item>
    <Form.Item
      name="whatsapp_number"
      label="WhatsApp Number"
      rules={[{ required: true, message: 'Number is required' }]}
    >
      <Input placeholder="91XXXXXXXXXX" />
    </Form.Item>
    <Form.Item name="birthdate" label="Birthdate" getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })} normalize={(v) => v?.format('YYYY-MM-DD') ?? null}>
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
    <Form.Item name="plan" label="Plan" initialValue={UserPlan.MAX}>
      <Select options={Object.values(UserPlan).map((p) => ({ label: p, value: p }))} />
    </Form.Item>
    <Form.Item name="is_verified" label="Verified" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item name="status" label="Status" initialValue={UserStatus.ACTIVE}>
      <Select options={Object.values(UserStatus).map((s) => ({ label: s, value: s }))} />
    </Form.Item>
    <Form.Item name="whatsapp_otp" label="OTP (plaintext, will be hashed)">
      <Input />
    </Form.Item>
    <Form.Item name="pin" label="PIN (plaintext, will be hashed)">
      <Input />
    </Form.Item>
  </>
);

function SendOtpButton({ record, refresh }: { record: AppUser; refresh: () => void }) {
  const handleOtp = async () => {
    try {
      const res = await generateOtp(record.id);
      message.success(`OTP: ${res.otp}`);
      window.open(res.whatsapp_url, '_blank');
      refresh();
    } catch {
      message.error('Failed to generate OTP');
    }
  };

  if (record.is_verified) return null;
  return (
    <Tooltip title="Send OTP via WhatsApp">
      <Button icon={<WhatsAppOutlined />} size="small" onClick={handleOtp} />
    </Tooltip>
  );
}

export default function UsersPage() {
  return (
    <CrudPage<AppUser>
      title="Users"
      api={usersApi}
      columns={columns}
      formFields={formFields}
      extraActions={(record, refresh) => <SendOtpButton record={record} refresh={refresh} />}
    />
  );
}
