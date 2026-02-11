import { Card, Input, Select, Tag, Space, Radio, Popconfirm, message } from 'antd';
import {
  UserOutlined,
  DeleteOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { ElementType } from '../../types/script';
import type { DialogueElement } from '../../types/script';
import { useStore } from '../../store';
import { getTtsAudioUrl } from '../../api/client';
import AudioWaveform from './AudioWaveform';

const { TextArea } = Input;

const LANGUAGE_OPTIONS = [
  { value: 'mr', label: 'Marathi' },
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'sa', label: 'Sanskrit' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'default',
  processing: 'processing',
  completed: 'success',
  error: 'error',
};

interface Props {
  element: DialogueElement;
  sceneId: string;
  onGenerate: (element: DialogueElement) => void;
  generating: boolean;
}

export default function DialogueCard({ element, sceneId, onGenerate, generating }: Props) {
  const updateElement = useStore((s) => s.updateElement);
  const removeElement = useStore((s) => s.removeElement);
  const selectDialogueVariation = useStore((s) => s.selectDialogueVariation);
  const removeDialogueVariation = useStore((s) => s.removeDialogueVariation);
  const characters = useStore((s) => s.chapter?.characters ?? []);
  const charColor = characters.find((c) => c.name === element.characterName)?.color ?? '#fa8c16';

  const variations = element.audioVariations ?? [];

  const handleCopy = () => {
    navigator.clipboard.writeText(element.dialogueText);
    message.success('Copied!');
  };

  return (
    <Card
      size="small"
      className="scene-element-card"
      style={{ background: '#1a1a1a', borderLeft: `3px solid ${charColor}` }}
      extra={
        <Space>
          {element.processingStatus && (
            <Tag color={STATUS_COLORS[element.processingStatus]}>
              {element.processingStatus}
            </Tag>
          )}
          {generating ? (
            <LoadingOutlined style={{ color: '#faad14', cursor: 'default' }} />
          ) : (
            <Popconfirm
              title="Generate TTS"
              description="Generate a new audio variation?"
              onConfirm={() => onGenerate(element)}
              okText="Generate"
            >
              <ThunderboltOutlined
                style={{ color: '#faad14', cursor: 'pointer' }}
              />
            </Popconfirm>
          )}
          <Popconfirm
            title="Delete element"
            description="This cannot be undone."
            onConfirm={() => removeElement(sceneId, element.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <DeleteOutlined
              style={{ color: '#ff4d4f', cursor: 'pointer' }}
            />
          </Popconfirm>
        </Space>
      }
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 200, flexShrink: 0, overflow: 'hidden' }}>
            <UserOutlined style={{ color: charColor }} />
            <span style={{ color: charColor }}>
              {element.characterName}
            </span>
            <Select
              size="small"
              value={element.language}
              options={LANGUAGE_OPTIONS}
              onChange={(lang) => updateElement(sceneId, element.id, { type: ElementType.DIALOGUE, language: lang })}
              style={{ width: 100 }}
            />
          </div>
          {element.audioUrl && (
            <AudioWaveform
              audioUrl={getTtsAudioUrl(element.audioUrl)}
              accentColor={charColor}
            />
          )}
        </div>
      }
    >
      {element.stageDirection && (
        <Input
          size="small"
          value={element.stageDirection}
          addonBefore="Direction"
          onChange={(e) => updateElement(sceneId, element.id, { type: ElementType.DIALOGUE, stageDirection: e.target.value })}
          style={{ marginBottom: 8, fontSize: 12 }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
        <CopyOutlined
          style={{ color: '#999', cursor: 'pointer', flexShrink: 0, marginTop: 6 }}
          onClick={handleCopy}
        />
        <TextArea
          value={element.dialogueText}
          onChange={(e) => updateElement(sceneId, element.id, { type: ElementType.DIALOGUE, dialogueText: e.target.value })}
          autoSize={{ minRows: 1, maxRows: 6 }}
          style={{ fontSize: 13 }}
        />
      </div>

      {variations.length > 0 && (
        <div style={{ marginTop: 12, borderTop: '1px solid #303030', paddingTop: 8 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>
            Variations ({variations.length})
          </div>
          <Radio.Group
            value={element.audioUrl}
            onChange={(e) => selectDialogueVariation(sceneId, element.id, e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...variations].reverse().map((v, idx) => (
                <div
                  key={v.ttsId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: element.audioUrl === v.ttsId ? '#1a2733' : 'transparent',
                  }}
                >
                  <Radio value={v.ttsId} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <AudioWaveform
                      audioUrl={getTtsAudioUrl(v.ttsId)}
                      accentColor={charColor}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: '#666', flexShrink: 0 }}>
                    #{variations.length - idx}
                  </span>
                  <Popconfirm
                    title="Delete variation"
                    description="Remove this audio variation?"
                    onConfirm={() => removeDialogueVariation(sceneId, element.id, v.ttsId)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <DeleteOutlined
                      style={{ color: '#666', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
                    />
                  </Popconfirm>
                </div>
              ))}
            </div>
          </Radio.Group>
        </div>
      )}
    </Card>
  );
}
