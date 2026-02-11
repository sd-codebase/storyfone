import { Card, InputNumber, Space, Typography } from 'antd';
import { PauseCircleOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { ElementType, ELEMENT_COLORS } from '../../types/script';
import type { PauseElement } from '../../types/script';
import { useStore } from '../../store';
import { useScenePlayback } from './ScenePlaybackContext';

interface Props {
  element: PauseElement;
  sceneId: string;
}

export default function PauseCard({ element, sceneId }: Props) {
  const updateElement = useStore((s) => s.updateElement);
  const removeElement = useStore((s) => s.removeElement);
  const { playingElementId, pauseRemaining } = useScenePlayback();
  const isActive = playingElementId === element.id;

  return (
    <Card
      size="small"
      className="scene-element-card"
      style={{ background: '#1a1a1a', borderLeft: `3px solid ${ELEMENT_COLORS.PAUSE}` }}
      title={
        <span>
          <PauseCircleOutlined style={{ marginRight: 8, color: ELEMENT_COLORS.PAUSE }} />
          PAUSE
        </span>
      }
      extra={
        <DeleteOutlined
          style={{ color: '#ff4d4f', cursor: 'pointer' }}
          onClick={() => removeElement(sceneId, element.id)}
        />
      }
    >
      <Space>
        <InputNumber
          size="small"
          value={element.duration}
          onChange={(val) => updateElement(sceneId, element.id, {
            type: ElementType.PAUSE,
            duration: val ?? 0,
          })}
          addonAfter="s"
          placeholder="Duration"
          min={0}
          step={0.5}
          style={{ width: 140 }}
        />
        {isActive && pauseRemaining != null && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            <LoadingOutlined spin style={{ marginRight: 4 }} />
            {pauseRemaining.toFixed(1)}s remaining
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
}
