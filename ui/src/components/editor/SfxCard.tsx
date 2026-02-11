import { useState } from 'react';
import { Card, Input, InputNumber, Space, message } from 'antd';
import {
  SoundOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { ElementType, ELEMENT_COLORS } from '../../types/script';
import type { SfxElement } from '../../types/script';
import { useStore } from '../../store';
import type { AudioFileInfo } from '../../types/api';
import { getAudioFileUrl } from '../../api/client';
import AudioLibraryModal from './AudioLibraryModal';
import AudioWaveform from './AudioWaveform';

interface Props {
  element: SfxElement;
  sceneId: string;
}

export default function SfxCard({ element, sceneId }: Props) {
  const updateElement = useStore((s) => s.updateElement);
  const removeElement = useStore((s) => s.removeElement);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleSelect = (audioFile: AudioFileInfo) => {
    updateElement(sceneId, element.id, {
      type: ElementType.SFX,
      audioFileId: audioFile.id,
      audioFileName: audioFile.filename,
      timing: {
        ...element.timing,
        duration: audioFile.duration_seconds ?? element.timing.duration,
      },
    });
    setLibraryOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(element.description);
    message.success('Copied!');
  };

  const truncatedName = element.audioFileName && element.audioFileName.length > 18
    ? element.audioFileName.slice(0, 18) + '…'
    : element.audioFileName;

  return (
    <>
      <Card
        size="small"
        className="scene-element-card"
        style={{ background: '#1a1a1a', borderLeft: `3px solid ${ELEMENT_COLORS.SFX}` }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 200, flexShrink: 0, overflow: 'hidden' }}>
              <SoundOutlined style={{ color: ELEMENT_COLORS.SFX }} />
              <span>SFX</span>
              {element.audioFileId && (
                <span style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {truncatedName}
                </span>
              )}
            </div>
            {element.audioFileId && (
              <AudioWaveform
                audioUrl={getAudioFileUrl(element.audioFileId)}
                accentColor={ELEMENT_COLORS.SFX}
                fadeIn={element.timing.fade_in}
                fadeOut={element.timing.fade_out}
                trimStart={element.timing.trim_start}
                playDuration={element.timing.duration}
              />
            )}
          </div>
        }
        extra={
          <Space>
            <FolderOpenOutlined
              style={{ color: ELEMENT_COLORS.SFX, cursor: 'pointer' }}
              onClick={() => setLibraryOpen(true)}
            />
            <DeleteOutlined
              style={{ color: '#ff4d4f', cursor: 'pointer' }}
              onClick={() => removeElement(sceneId, element.id)}
            />
          </Space>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <CopyOutlined
            style={{ color: '#999', cursor: 'pointer', flexShrink: 0 }}
            onClick={handleCopy}
          />
          <Input
            value={element.description}
            onChange={(e) => updateElement(sceneId, element.id, { type: ElementType.SFX, description: e.target.value })}
            placeholder="Sound effect description"
            style={{ fontSize: 13 }}
          />
        </div>
        <Space>
          <InputNumber
            size="small"
            value={element.timing.trim_start}
            onChange={(val) => updateElement(sceneId, element.id, {
              type: ElementType.SFX,
              timing: { ...element.timing, trim_start: val ?? undefined },
            })}
            addonAfter="s"
            placeholder="Start"
            min={0}
            step={0.5}
            style={{ width: 120 }}
          />
          <InputNumber
            size="small"
            value={element.timing.duration}
            onChange={(val) => updateElement(sceneId, element.id, {
              type: ElementType.SFX,
              timing: { ...element.timing, duration: val ?? undefined },
            })}
            addonAfter="s"
            placeholder="Duration"
            min={0}
            step={0.5}
            style={{ width: 120 }}
          />
          <InputNumber
            size="small"
            value={element.timing.fade_in}
            onChange={(val) => updateElement(sceneId, element.id, {
              type: ElementType.SFX,
              timing: { ...element.timing, fade_in: val ?? undefined },
            })}
            addonAfter="s"
            placeholder="Fade in"
            min={0}
            step={0.5}
            style={{ width: 120 }}
          />
          <InputNumber
            size="small"
            value={element.timing.fade_out}
            onChange={(val) => updateElement(sceneId, element.id, {
              type: ElementType.SFX,
              timing: { ...element.timing, fade_out: val ?? undefined },
            })}
            addonAfter="s"
            placeholder="Fade out"
            min={0}
            step={0.5}
            style={{ width: 120 }}
          />
        </Space>
      </Card>

      <AudioLibraryModal
        open={libraryOpen}
        category="sfx"
        onSelect={handleSelect}
        onClose={() => setLibraryOpen(false)}
      />
    </>
  );
}
