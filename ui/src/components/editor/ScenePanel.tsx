import { useState, useMemo, useCallback, useRef } from 'react';
import { Card, Typography, Button, Space, Tag, Tooltip, Popconfirm, message } from 'antd';
import { PlusOutlined, SoundOutlined, CustomerServiceOutlined, MessageOutlined, PauseCircleOutlined, CaretRightOutlined, BorderOutlined, ThunderboltOutlined, LoadingOutlined, MergeCellsOutlined, PlayCircleOutlined, PauseOutlined } from '@ant-design/icons';
import { ElementType, ELEMENT_COLORS } from '../../types/script';
import type { Scene, SceneElement, DialogueElement } from '../../types/script';
import SceneElementList from './SceneElementList';
import AddElementModal from './AddElementModal';
import { ScenePlaybackProvider, useScenePlayback } from './ScenePlaybackContext';
import { useDialogueGenerate } from './useDialogueGenerate';
import { mixScene, getMixAudioUrl } from '../../api/client';

const FILTERS = [
  { type: ElementType.DIALOGUE, label: 'Dialogue', icon: <MessageOutlined />, color: '#fa8c16' },
  { type: ElementType.SFX, label: 'SFX', icon: <SoundOutlined />, color: ELEMENT_COLORS.SFX },
  { type: ElementType.BGM, label: 'BGM', icon: <CustomerServiceOutlined />, color: ELEMENT_COLORS.BGM },
  { type: ElementType.PAUSE, label: 'Pause', icon: <PauseCircleOutlined />, color: ELEMENT_COLORS.PAUSE },
] as const;

interface Props {
  scene: Scene;
}

function PlayButton({ elements }: { elements: SceneElement[] }) {
  const { isPlaying, playScene, stopScene } = useScenePlayback();

  if (isPlaying) {
    return (
      <Tooltip title="Stop playback">
        <Button
          size="small"
          icon={<BorderOutlined />}
          onClick={stopScene}
          danger
        >
          Stop
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Play all elements in order">
      <Button
        size="small"
        icon={<CaretRightOutlined />}
        onClick={() => playScene(elements)}
        disabled={elements.length === 0}
      >
        Play
      </Button>
    </Tooltip>
  );
}

function GenerateButton({ elements, generate, loadingIds }: {
  elements: SceneElement[];
  generate: (el: DialogueElement) => Promise<void>;
  loadingIds: Set<string>;
}) {
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

  const dialogues = useMemo(
    () => elements.filter((el): el is DialogueElement => el.type === ElementType.DIALOGUE),
    [elements],
  );

  const handleBatchGenerate = useCallback(async () => {
    if (dialogues.length === 0) return;
    setBatchProgress({ done: 0, total: dialogues.length });
    for (let i = 0; i < dialogues.length; i++) {
      await generate(dialogues[i]);
      setBatchProgress({ done: i + 1, total: dialogues.length });
    }
    setBatchProgress(null);
  }, [dialogues, generate]);

  if (dialogues.length === 0) return null;

  const isBusy = batchProgress !== null || loadingIds.size > 0;

  if (isBusy) {
    return (
      <Tooltip title={`${batchProgress?.done ?? 0}/${batchProgress?.total ?? '...'}`}>
        <Button
          size="small"
          icon={<LoadingOutlined />}
          disabled
        >
          {batchProgress ? `${batchProgress.done}/${batchProgress.total}` : 'Generate'}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Popconfirm
      title="Generate all TTS"
      description={`Generate audio for ${dialogues.length} dialogue(s)?`}
      onConfirm={handleBatchGenerate}
      okText="Generate"
    >
      <Button
        size="small"
        icon={<ThunderboltOutlined />}
      >
        Generate
      </Button>
    </Popconfirm>
  );
}

function MixButton({ sceneId, elements }: { sceneId: string; elements: SceneElement[] }) {
  const [mixing, setMixing] = useState(false);
  const [mixReady, setMixReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleMix = useCallback(async () => {
    setMixing(true);
    setMixReady(false);
    try {
      const res = await mixScene(sceneId, elements);
      if (res.status === 'error') {
        message.error(res.error ?? 'Mix failed');
        return;
      }
      if (res.warnings?.length) {
        res.warnings.forEach((w) => message.warning(w, 4));
      }
      message.success(`Mixed ${res.duration_seconds?.toFixed(1)}s audio`);
      setMixReady(true);
    } catch (err) {
      message.error('Mix request failed');
    } finally {
      setMixing(false);
    }
  }, [sceneId, elements]);

  const handlePlayStop = useCallback(() => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    const url = getMixAudioUrl(sceneId) + `?t=${Date.now()}`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener('ended', () => setPlaying(false), { once: true });
    audio.addEventListener('error', () => { setPlaying(false); message.error('Playback failed'); }, { once: true });
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [sceneId, playing]);

  return (
    <Space.Compact>
      <Tooltip title={mixReady ? 'Remix scene audio' : 'Mix scene into single audio file'}>
        <Button
          size="small"
          icon={mixing ? <LoadingOutlined /> : <MergeCellsOutlined />}
          onClick={handleMix}
          disabled={mixing || elements.length === 0}
        >
          {mixing ? 'Mixing' : 'Mix'}
        </Button>
      </Tooltip>
      {mixReady && (
        <Tooltip title={playing ? 'Stop mixed audio' : 'Play mixed audio'}>
          <Button
            size="small"
            type="primary"
            icon={playing ? <PauseOutlined /> : <PlayCircleOutlined />}
            onClick={handlePlayStop}
          />
        </Tooltip>
      )}
    </Space.Compact>
  );
}

export default function ScenePanel({ scene }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const { generate, isLoading, loadingIds } = useDialogueGenerate(scene.id);

  const toggleType = (type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredElements = useMemo(
    () => scene.elements.filter((el) => !hiddenTypes.has(el.type)),
    [scene.elements, hiddenTypes],
  );

  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const el of scene.elements) {
      counts[el.type] = (counts[el.type] ?? 0) + 1;
    }
    return counts;
  }, [scene.elements]);

  return (
    <ScenePlaybackProvider>
      <Card
        title={
          <Typography.Text strong>
            Scene {scene.sceneNumber}: {scene.title}
          </Typography.Text>
        }
        extra={
          <Space>
            <PlayButton elements={scene.elements} />
            <GenerateButton elements={scene.elements} generate={generate} loadingIds={loadingIds} />
            <MixButton sceneId={scene.id} elements={scene.elements} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {filteredElements.length}/{scene.elements.length}
            </Typography.Text>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
            >
              Add
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          <Tag
            color={hiddenTypes.size === 0 ? '#1668dc' : undefined}
            onClick={() => setHiddenTypes(new Set(hiddenTypes.size === 0
              ? FILTERS.map((f) => f.type)
              : [],
            ))}
            style={{
              cursor: 'pointer',
              opacity: hiddenTypes.size === 0 ? 1 : 0.4,
              userSelect: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            All ({scene.elements.length})
          </Tag>
          {FILTERS.map((f) => {
            const count = countByType[f.type] ?? 0;
            if (count === 0) return null;
            const active = !hiddenTypes.has(f.type);
            return (
              <Tag
                key={f.type}
                icon={f.icon}
                color={active ? f.color : undefined}
                onClick={() => toggleType(f.type)}
                style={{
                  cursor: 'pointer',
                  opacity: active ? 1 : 0.4,
                  userSelect: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                {f.label} ({count})
              </Tag>
            );
          })}
        </div>

        <SceneElementList
          sceneId={scene.id}
          elements={filteredElements}
          onGenerate={generate}
          isGenerating={isLoading}
        />

        <AddElementModal
          open={addModalOpen}
          sceneId={scene.id}
          insertIndex={scene.elements.length}
          onClose={() => setAddModalOpen(false)}
        />
      </Card>
    </ScenePlaybackProvider>
  );
}
