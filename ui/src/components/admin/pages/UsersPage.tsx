import { Button, Form, Input, InputNumber, Select, Switch, Tag, Tooltip, message } from 'antd';
import { WhatsAppOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import CrudPage from '../CrudPage';
import { usersApi, generateOtp } from '../../../api/client';
import type { AppUser } from '../../../types/admin';
import { UserPlan, UserStatus } from '../../../types/admin';

function calcAge(birthYear: number | null): string {
  if (!birthYear) return '—';
  return String(new Date().getFullYear() - birthYear);
}

const statusColors: Record<string, string> = {
  active: 'green',
  disabled: 'orange',
  deleted: 'red',
};

const columns: ColumnsType<AppUser> = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  {
    title: 'WhatsApp',
    key: 'whatsapp_number',
    width: 200,
    render: (_, r) => r.country_code ? `+${r.country_code} ${r.whatsapp_number}` : r.whatsapp_number,
  },
  {
    title: 'Birth Year',
    dataIndex: 'birth_year',
    key: 'birth_year',
    width: 110,
    render: (v: number | null) => v ? String(v) : '—',
  },
  {
    title: 'Age',
    key: 'age',
    width: 60,
    render: (_, r) => {
      const age = calcAge(r.birth_year);
      if (age === '—') return age;
      const num = Number(age);
      return <Tag color={num < 18 ? 'red' : 'green'}>{age}</Tag>;
    },
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

const currentYear = new Date().getFullYear();

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
    <Form.Item name="birth_year" label="Birth Year">
      <InputNumber min={1920} max={currentYear} style={{ width: '100%' }} placeholder="e.g. 1995" />
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

function ToggleStatusButton({ record, refresh }: { record: AppUser; refresh: () => void }) {
  const isDisabled = record.status === 'disabled';
  const handleToggle = async () => {
    try {
      await usersApi.update(record.id, { status: isDisabled ? 'active' : 'disabled' });
      message.success(isDisabled ? 'User enabled' : 'User disabled');
      refresh();
    } catch {
      message.error('Failed to update status');
    }
  };

  return (
    <Tooltip title={isDisabled ? 'Enable user' : 'Disable user'}>
      <Button
        icon={isDisabled ? <CheckCircleOutlined /> : <StopOutlined />}
        size="small"
        danger={!isDisabled}
        onClick={handleToggle}
      />
    </Tooltip>
  );
}

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
      extraActions={(record, refresh) => (
        <>
          <ToggleStatusButton record={record} refresh={refresh} />
          <SendOtpButton record={record} refresh={refresh} />
        </>
      )}
      canDelete={(record) => record.status === 'disabled' ? true : 'Disable the user first before deleting'}
    />
  );
}
