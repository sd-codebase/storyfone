import { Table, Input, ColorPicker, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useStore } from '../../store';
import type { Character } from '../../types/script';
import VoiceSelect from './VoiceSelect';

const PITCH_OPTIONS = ['-4st', '-3st', '-2st', '-1st', '0st', '+1st', '+2st', '+3st', '+4st'];
const RATE_OPTIONS = ['0.7', '0.8', '0.9', '1.0', '1.1', '1.2', '1.3'];
const VOLUME_OPTIONS = ['x-soft', 'soft', 'medium', 'loud', 'x-loud'];

export default function CharacterList() {
  const characters = useStore((s) => s.chapter?.characters ?? []);
  const updateCharacter = useStore((s) => s.updateCharacter);

  const columns = [
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 56,
      render: (color: string, record: Character) => (
        <ColorPicker
          value={color}
          size="small"
          onChange={(_value, hex) => updateCharacter(record.id, { color: hex })}
        />
      ),
    },
    {
      title: 'Character',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string, record: Character) => (
        <span>
          <UserOutlined style={{ marginRight: 8, color: record.color }} />
          <span style={{ color: record.color, fontWeight: 500 }}>{name}</span>
        </span>
      ),
    },
    {
      title: 'Voice',
      dataIndex: 'voiceName',
      key: 'voiceName',
      width: 240,
      render: (voiceName: string, record: Character) => (
        <VoiceSelect
          value={voiceName}
          onChange={(name) => updateCharacter(record.id, { voiceName: name })}
        />
      ),
    },
    {
      title: 'Pitch',
      dataIndex: 'pitch',
      key: 'pitch',
      width: 90,
      render: (pitch: string, record: Character) => (
        <Select
          value={pitch ?? '0st'}
          size="small"
          style={{ width: 80 }}
          onChange={(v) => updateCharacter(record.id, { pitch: v })}
          options={PITCH_OPTIONS.map((o) => ({ label: o, value: o }))}
        />
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 80,
      render: (rate: string, record: Character) => (
        <Select
          value={rate ?? '1.0'}
          size="small"
          style={{ width: 70 }}
          onChange={(v) => updateCharacter(record.id, { rate: v })}
          options={RATE_OPTIONS.map((o) => ({ label: o, value: o }))}
        />
      ),
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      width: 100,
      render: (volume: string, record: Character) => (
        <Select
          value={volume ?? 'medium'}
          size="small"
          style={{ width: 90 }}
          onChange={(v) => updateCharacter(record.id, { volume: v })}
          options={VOLUME_OPTIONS.map((o) => ({ label: o, value: o }))}
        />
      ),
    },
    {
      title: 'Voice Style Description',
      dataIndex: 'defaultVoiceStyle',
      key: 'defaultVoiceStyle',
      render: (style: string, record: Character) => (
        <Input
          value={style}
          onChange={(e) => updateCharacter(record.id, { defaultVoiceStyle: e.target.value })}
          variant="borderless"
          style={{ fontSize: 13 }}
          placeholder="Natural language style instruction..."
        />
      ),
    },
  ];

  return (
    <Table
      dataSource={characters}
      columns={columns}
      rowKey="id"
      pagination={false}
      size="small"
      style={{ marginBottom: 16 }}
    />
  );
}
