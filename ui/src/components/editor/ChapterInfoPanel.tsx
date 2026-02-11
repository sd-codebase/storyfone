import { useRef, useState } from 'react';
import { Button, Descriptions, message, Space, Typography } from 'antd';
import { AudioOutlined, DownloadOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useStore } from '../../store';
import { mixChapter, getChapterMixAudioUrl } from '../../api/client';

export default function ChapterInfoPanel() {
  const chapter = useStore((s) => s.chapter);
  const updateChapterTitle = useStore((s) => s.updateChapterTitle);

  const [mixing, setMixing] = useState(false);
  const [mixed, setMixed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!chapter) return null;

  const totalElements = chapter.scenes.reduce((acc, s) => acc + s.elements.length, 0);

  const handleMixAll = async () => {
    if (!chapter) return;
    setMixing(true);
    setMixed(false);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    try {
      const scenes = chapter.scenes.map((s) => ({
        sceneId: s.id,
        elements: s.elements,
      }));
      const res = await mixChapter(chapter.id, scenes);
      if (res.status === 'completed') {
        setMixed(true);
        const dur = res.duration_seconds ? `${res.duration_seconds.toFixed(1)}s` : '';
        message.success(`Chapter mixed${dur ? ` (${dur})` : ''}`);
        if (res.warnings?.length) {
          res.warnings.forEach((w) => message.warning(w, 5));
        }
      } else {
        message.error(res.error || 'Mix failed');
      }
    } catch {
      message.error('Chapter mix request failed');
    } finally {
      setMixing(false);
    }
  };

  const handlePlay = () => {
    if (!chapter) return;
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    const url = getChapterMixAudioUrl(chapter.id);
    const audio = new Audio(`${url}?t=${Date.now()}`);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => {
      setPlaying(false);
      message.error('Failed to play chapter audio');
    };
    audioRef.current = audio;
    audio.play();
    setPlaying(true);
  };

  return (
    <div>
      <Descriptions
        bordered
        size="small"
        column={3}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Chapter Title" span={3}>
          <Typography.Text
            editable={{ onChange: updateChapterTitle }}
            style={{ margin: 0 }}
          >
            {chapter.title}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Characters">{chapter.characters.length}</Descriptions.Item>
        <Descriptions.Item label="Scenes">{chapter.scenes.length}</Descriptions.Item>
        <Descriptions.Item label="Total Elements">{totalElements}</Descriptions.Item>
      </Descriptions>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<AudioOutlined />}
          loading={mixing}
          onClick={handleMixAll}
        >
          {mixing ? 'Mixing...' : 'Mix All Scenes'}
        </Button>
        {mixed && (
          <>
            <Button
              icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlay}
            >
              {playing ? 'Stop' : 'Play Chapter'}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              href={getChapterMixAudioUrl(chapter.id)}
              download={`${chapter.title || 'chapter'}.wav`}
            >
              Download
            </Button>
          </>
        )}
      </Space>
    </div>
  );
}
