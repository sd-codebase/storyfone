import { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Table, Button, Space, Upload, message } from 'antd';
import {
  SearchOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { AudioFileInfo } from '../../types/api';
import { searchAudio, listAudio, uploadAudio, deleteAudio, getAudioFileUrl } from '../../api/client';

interface Props {
  open: boolean;
  category: 'sfx' | 'bgm';
  onSelect: (audio: AudioFileInfo) => void;
  onClose: () => void;
}

export default function AudioLibraryModal({ open, category, onSelect, onClose }: Props) {
  const [files, setFiles] = useState<AudioFileInfo[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl] = useState(() => new Audio());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (query.trim()) {
        const res = await searchAudio(query, category);
        setFiles(res.results);
      } else {
        const res = await listAudio(category);
        setFiles(res);
      }
    } catch {
      message.error('Failed to load audio library');
    }
    setLoading(false);
  }, [query, category]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    return () => {
      audioEl.pause();
    };
  }, [audioEl]);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      audioEl.pause();
      setPlayingId(null);
      return;
    }
    audioEl.src = getAudioFileUrl(id);
    audioEl.play();
    setPlayingId(id);
    audioEl.onended = () => setPlayingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAudio(id);
      message.success('Deleted');
      refresh();
    } catch {
      message.error('Failed to delete');
    }
  };

  const handleUpload = async (file: File) => {
    const desc = file.name.replace(/\.[^.]+$/, '');
    try {
      await uploadAudio(file, category, desc, '');
      message.success('Uploaded');
      refresh();
    } catch {
      message.error('Upload failed');
    }
    return false; // prevent default upload
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 80,
      render: (_: unknown, row: AudioFileInfo) =>
        row.duration_seconds ? `${row.duration_seconds}s` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: unknown, row: AudioFileInfo) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={playingId === row.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handlePlay(row.id)}
          />
          <Button size="small" type="primary" onClick={() => onSelect(row)}>
            Select
          </Button>
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(row.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`${category.toUpperCase()} Library`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Space style={{ marginBottom: 12, width: '100%' }} direction="vertical">
        <Space>
          <Input
            placeholder="Search audio files..."
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={refresh}
            style={{ width: 300 }}
          />
          <Button onClick={refresh}>Search</Button>
          <Upload
            accept="audio/*"
            showUploadList={false}
            beforeUpload={handleUpload}
          >
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Space>
      </Space>

      <Table
        dataSource={files}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        size="small"
      />
    </Modal>
  );
}
