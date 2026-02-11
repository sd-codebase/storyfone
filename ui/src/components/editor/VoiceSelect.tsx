import { Select, Typography } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { GEMINI_VOICES, GEMINI_VOICE_MAP } from '../../types/voices';
import type { GeminiVoice } from '../../types/voices';

interface Props {
  value?: string;
  onChange?: (voiceName: string) => void;
}

function VoiceOption({ voice }: { voice: GeminiVoice }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
      <SoundOutlined style={{ fontSize: 16, color: '#888', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 500, fontSize: 13, lineHeight: '18px' }}>{voice.name}</div>
        <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: '16px' }}>
          {voice.tone}, {voice.pitch}
        </Typography.Text>
      </div>
    </div>
  );
}

export default function VoiceSelect({ value, onChange }: Props) {
  const selectedVoice = value ? GEMINI_VOICE_MAP.get(value) : undefined;

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder="Select voice"
      popupMatchSelectWidth={280}
      listHeight={320}
      style={{ width: '100%' }}
      size="small"
      showSearch
      optionFilterProp="label"
      labelRender={() => {
        if (!selectedVoice) return <span style={{ color: '#888' }}>Select voice</span>;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SoundOutlined style={{ fontSize: 13, color: '#888' }} />
            <span style={{ fontWeight: 500 }}>{selectedVoice.name}</span>
          </span>
        );
      }}
      optionLabelProp="label"
      options={GEMINI_VOICES.map((voice) => ({
        value: voice.name,
        label: `${voice.name} ${voice.tone} ${voice.pitch}`,
      }))}
      optionRender={(option) => {
        const voice = GEMINI_VOICE_MAP.get(option.value as string);
        return voice ? <VoiceOption voice={voice} /> : null;
      }}
    />
  );
}
