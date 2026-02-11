import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import Hls from 'hls.js';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile as AntUploadFile } from 'antd/es/upload';
import {
  API_BASE,
  booksApi,
  chaptersApi,
  languagesApi,
  genresApi,
  authorsApi,
  narratorsApi,
} from '../../../api/client';
import type { Book, Language, Genre, Author, Narrator, Chapter } from '../../../types/admin';
import { AudioStatus } from '../../../types/admin';
import { UploadCategory } from '../../../api/upload';
import { useFileUpload } from '../../../hooks/useFileUpload';
import ChapterDrawer from './BookChaptersPage';

const audioStatusColors: Record<string, string> = {
  draft: 'default',
  processing: 'processing',
  processed: 'green',
  error: 'red',
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Lookup data
  const [languages, setLanguages] = useState<Language[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [narrators, setNarrators] = useState<Narrator[]>([]);

  // Upload hooks
  const thumbnail = useFileUpload({ category: UploadCategory.BOOK_THUMBNAIL, maxSizeKb: 250 });
  const audio = useFileUpload({ category: UploadCategory.BOOK_AUDIO, maxSizeKb: 5120 });

  // Chapters state (for embedded table inside book drawer)
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Chapter drawer state
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // HLS audio player
  const [playingBookId, setPlayingBookId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const stopPlayback = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setPlayingBookId(null);
  }, []);

  const playHls = useCallback((bookId: string, hlsUrl: string) => {
    stopPlayback();

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => setPlayingBookId(null));
    }

    const src = `${API_BASE}${hlsUrl}`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(audioRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => audioRef.current?.play());
      hls.on(Hls.Events.ERROR, () => {
        message.error('Failed to play audio');
        stopPlayback();
      });
      hlsRef.current = hls;
    } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      audioRef.current.src = src;
      audioRef.current.play();
    } else {
      message.error('HLS not supported in this browser');
      return;
    }

    setPlayingBookId(bookId);
  }, [stopPlayback]);

  // Cleanup on unmount
  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const hasPendingUploads = (thumbnail.file && !thumbnail.uploaded) || (audio.file && !audio.uploaded);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setBooks(await booksApi.list());
    } catch {
      message.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    languagesApi.list().then(setLanguages).catch(() => {});
    genresApi.list().then(setGenres).catch(() => {});
    authorsApi.list().then(setAuthors).catch(() => {});
    narratorsApi.list().then(setNarrators).catch(() => {});
  }, [refresh]);

  const refreshChapters = useCallback(async (bookId: string) => {
    setChaptersLoading(true);
    try {
      setChapters(await chaptersApi.list(bookId));
    } catch {
      message.error('Failed to load chapters');
    } finally {
      setChaptersLoading(false);
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    thumbnail.clear();
    audio.clear();
    setSaving(false);
    setChapters([]);
    setDrawerOpen(true);
  };

  const openEdit = (record: Book) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      authors: record.authors,
      narrators: record.narrators,
      language: record.language,
      genres: record.genres,
      description: record.description,
      is_adult: record.is_adult,
    });
    thumbnail.clear();
    audio.clear();
    setSaving(false);
    setDrawerOpen(true);
    refreshChapters(record.id);
  };

  const saveBook = async (values: Record<string, unknown>) => {
    try {
      setSaving(true);
      const fields: Record<string, unknown> = { ...values };
      if (thumbnail.result) fields.thumbnail_url = thumbnail.result.url;
      if (audio.result) fields.preview_audio_raw = audio.result.path;

      if (editing) {
        await booksApi.update(editing.id, fields);
        message.success('Book updated');
      } else {
        await booksApi.create(fields);
        message.success('Book created');
      }

      setSaving(false);
      setDrawerOpen(false);
      form.resetFields();
      refresh();
    } catch {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedGenreIds: string[] = values.genres ?? [];
      const hasAdultGenre = genres.some((g) => g.is_adult && selectedGenreIds.includes(g.id));
      const isAdult = !!values.is_adult;

      if (hasAdultGenre && !isAdult) {
        Modal.error({
          title: 'Adult content mismatch',
          content: 'One or more selected genres are marked 18+, but the book is not marked as adult. Please enable "Adult Content" or remove the 18+ genre.',
        });
        return;
      }

      if (isAdult || hasAdultGenre) {
        Modal.confirm({
          title: 'Adult content',
          content: 'This book is marked as 18+ adult content. Are you sure you want to save?',
          okText: 'Yes, save',
          cancelText: 'Cancel',
          onOk: () => saveBook(values),
        });
        return;
      }

      await saveBook(values);
    } catch {
      // validation failed — form shows inline errors
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await booksApi.remove(id);
      message.success('Book deleted');
      refresh();
    } catch {
      message.error('Failed to delete');
    }
  };

  const handleProcessAudio = async (id: string) => {
    try {
      message.loading({ content: 'Processing audio...', key: 'process' });
      await booksApi.processAudio(id);
      message.success({ content: 'Audio processed', key: 'process' });
      refresh();
    } catch {
      message.error({ content: 'Processing failed', key: 'process' });
    }
  };

  const handlePublishToggle = async (record: Book) => {
    try {
      if (record.is_published) {
        await booksApi.unpublish(record.id);
        message.success('Book unpublished');
      } else {
        await booksApi.publish(record.id);
        message.success('Book published');
      }
      refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail: string } } }).response?.data?.detail
          : 'Failed';
      message.error(msg || 'Operation failed');
    }
  };

  // Chapter actions
  const handleDeleteChapter = async (chapterId: string) => {
    if (!editing) return;
    try {
      await chaptersApi.remove(editing.id, chapterId);
      message.success('Chapter deleted');
      refreshChapters(editing.id);
    } catch {
      message.error('Failed to delete');
    }
  };

  const handleProcessChapterAudio = async (chapterId: string) => {
    if (!editing) return;
    try {
      message.loading({ content: 'Processing audio...', key: 'chProcess' });
      await chaptersApi.processAudio(editing.id, chapterId);
      message.success({ content: 'Audio processed', key: 'chProcess' });
      refreshChapters(editing.id);
    } catch {
      message.error({ content: 'Processing failed', key: 'chProcess' });
    }
  };

  const handleChapterPublishToggle = async (record: Chapter) => {
    if (!editing) return;
    try {
      if (record.is_published) {
        await chaptersApi.unpublish(editing.id, record.id);
        message.success('Chapter unpublished');
      } else {
        await chaptersApi.publish(editing.id, record.id);
        message.success('Chapter published');
      }
      refreshChapters(editing.id);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail: string } } }).response?.data?.detail
          : 'Failed';
      message.error(msg || 'Operation failed');
    }
  };

  const resolveNames = (ids: string[], lookup: { id: string; name: string }[]) => {
    const map = new Map(lookup.map((l) => [l.id, l.name]));
    return ids.map((id) => map.get(id) ?? id).join(', ');
  };

  const columns: ColumnsType<Book> = [
    {
      title: 'Title',
      key: 'title',
      render: (_, r) => (
        <Space>
          {r.thumbnail_url && (
            <img
              src={`${API_BASE}${r.thumbnail_url}`}
              alt=""
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          {r.title}
        </Space>
      ),
    },
    {
      title: 'Language',
      key: 'language',
      width: 120,
      render: (_, r) => {
        if (!r.language) return '—';
        const lang = languages.find((l) => l.id === r.language);
        return lang?.name ?? r.language;
      },
    },
    {
      title: 'Authors',
      key: 'authors',
      width: 180,
      render: (_, r) => resolveNames(r.authors, authors) || '—',
    },
    {
      title: 'Audio',
      dataIndex: 'audio_status',
      key: 'audio_status',
      width: 110,
      render: (v: string) => (
        <Tag color={audioStatusColors[v] ?? 'default'}>{v}</Tag>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openEdit(record)}
            title="View / Edit"
          />
          <Button
            icon={<ThunderboltOutlined />}
            size="small"
            disabled={!record.preview_audio_raw || record.audio_status === AudioStatus.PROCESSING}
            onClick={() => handleProcessAudio(record.id)}
            title="Process Audio"
          />
          {record.preview_audio_hls && record.audio_status === AudioStatus.PROCESSED ? (
            <Button
              icon={playingBookId === record.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              size="small"
              onClick={() =>
                playingBookId === record.id
                  ? stopPlayback()
                  : playHls(record.id, record.preview_audio_hls!)
              }
              title={playingBookId === record.id ? 'Stop' : 'Play Preview'}
            />
          ) : (
            <Button icon={<PlayCircleOutlined />} size="small" disabled title="No processed audio" />
          )}
          <Button
            size="small"
            onClick={() => handlePublishToggle(record)}
            type={record.is_published ? 'default' : 'primary'}
          >
            {record.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Popconfirm title="Delete book and all chapters?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const chapterColumns: ColumnsType<Chapter> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => (
        <Space>
          {r.thumbnail_url && (
            <img
              src={`${API_BASE}${r.thumbnail_url}`}
              alt=""
              style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          {r.name}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={audioStatusColors[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: 'Published',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 90,
      render: (v: boolean) =>
        v ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingChapter(record);
              setChapterDrawerOpen(true);
            }}
          />
          <Button
            icon={<ThunderboltOutlined />}
            size="small"
            disabled={!record.audio_raw || record.status === AudioStatus.PROCESSING}
            onClick={() => handleProcessChapterAudio(record.id)}
            title="Process Audio"
          />
          {record.audio_hls && record.status === AudioStatus.PROCESSED ? (
            <Button
              icon={playingBookId === record.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              size="small"
              onClick={() =>
                playingBookId === record.id
                  ? stopPlayback()
                  : playHls(record.id, record.audio_hls!)
              }
              title={playingBookId === record.id ? 'Stop' : 'Play'}
            />
          ) : (
            <Button icon={<PlayCircleOutlined />} size="small" disabled title="No processed audio" />
          )}
          <Button
            size="small"
            onClick={() => handleChapterPublishToggle(record)}
            type={record.is_published ? 'default' : 'primary'}
          >
            {record.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Popconfirm title="Delete chapter?" onConfirm={() => handleDeleteChapter(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Books</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Book
        </Button>
      </div>
      <Table<Book>
        rowKey="id"
        dataSource={books}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="middle"
      />

      <Drawer
        title={editing ? `Edit Book — ${editing.title}` : 'Add Book'}
        placement="right"
        width={720}
        open={drawerOpen}
        onClose={() => !saving && setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => !saving && setDrawerOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={saving}
              disabled={saving || !!hasPendingUploads}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="authors" label="Authors">
            <Select
              mode="multiple"
              placeholder="Select authors"
              options={authors.map((a) => ({ label: a.name, value: a.id }))}
            />
          </Form.Item>
          <Form.Item name="narrators" label="Narrators">
            <Select
              mode="multiple"
              placeholder="Select narrators"
              options={narrators.map((n) => ({ label: n.name, value: n.id }))}
            />
          </Form.Item>
          <Form.Item name="language" label="Language">
            <Select
              allowClear
              placeholder="Select language"
              options={languages.map((l) => ({ label: l.name, value: l.id }))}
            />
          </Form.Item>
          <Form.Item name="genres" label="Genres">
            <Select
              mode="multiple"
              placeholder="Select genres"
              options={genres.map((g) => ({
                label: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {g.name}
                    {g.is_adult && (
                      <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '0 5px', borderRadius: 3, lineHeight: '16px' }}>
                        18+
                      </span>
                    )}
                  </span>
                ),
                value: g.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="is_adult" label="Adult Content" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Thumbnail (< 250KB)">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={(file) => {
                  thumbnail.selectFile(file);
                  return false;
                }}
                onRemove={() => thumbnail.clear()}
                fileList={
                  thumbnail.file
                    ? [{ uid: '-1', name: thumbnail.file.name, status: 'done' } as AntUploadFile]
                    : []
                }
              >
                <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
              </Upload>
              {thumbnail.file && !thumbnail.uploaded && !thumbnail.error && (
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={thumbnail.upload}
                  loading={thumbnail.uploading}
                  type="primary"
                  size="small"
                >
                  Upload Thumbnail
                </Button>
              )}
              {thumbnail.uploaded && (
                <Tag icon={<CheckCircleOutlined />} color="success">Uploaded</Tag>
              )}
              {thumbnail.error && (
                <Space>
                  <Tag color="error">{thumbnail.error}</Tag>
                  <Button size="small" onClick={thumbnail.upload}>Retry</Button>
                </Space>
              )}
              {thumbnail.uploading && (
                <Progress
                  percent={thumbnail.progress}
                  size="small"
                  status={thumbnail.progress >= 100 ? 'active' : undefined}
                  format={(p) => (p !== undefined && p >= 100) ? 'Saving...' : `${p}%`}
                />
              )}
              {editing?.thumbnail_url && !thumbnail.file && (
                <img
                  src={`${API_BASE}${editing.thumbnail_url}`}
                  alt="Current thumbnail"
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item label="Preview Audio (max 5MB, 15-30s)">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                maxCount={1}
                accept="audio/*"
                beforeUpload={(file) => {
                  audio.selectFile(file);
                  return false;
                }}
                onRemove={() => audio.clear()}
                fileList={
                  audio.file
                    ? [{ uid: '-1', name: audio.file.name, status: 'done' } as AntUploadFile]
                    : []
                }
              >
                <Button icon={<UploadOutlined />}>Select Audio</Button>
              </Upload>
              {audio.file && !audio.uploaded && !audio.error && (
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={audio.upload}
                  loading={audio.uploading}
                  type="primary"
                  size="small"
                >
                  Upload Audio
                </Button>
              )}
              {audio.uploaded && (
                <Tag icon={<CheckCircleOutlined />} color="success">Uploaded</Tag>
              )}
              {audio.error && (
                <Space>
                  <Tag color="error">{audio.error}</Tag>
                  <Button size="small" onClick={audio.upload}>Retry</Button>
                </Space>
              )}
              {audio.uploading && (
                <Progress
                  percent={audio.progress}
                  size="small"
                  status={audio.progress >= 100 ? 'active' : undefined}
                  format={(p) => (p !== undefined && p >= 100) ? 'Saving...' : `${p}%`}
                />
              )}
              {editing?.preview_audio_raw && !audio.file && (
                <Tag icon={<CheckCircleOutlined />} color="blue">Current audio uploaded</Tag>
              )}
            </Space>
          </Form.Item>
        </Form>

        {editing && (
          <>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Chapters</h3>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingChapter(null);
                  setChapterDrawerOpen(true);
                }}
              >
                Add Chapter
              </Button>
            </div>
            <Table<Chapter>
              rowKey="id"
              dataSource={chapters}
              columns={chapterColumns}
              loading={chaptersLoading}
              pagination={false}
              size="small"
            />
          </>
        )}

        {editing && (
          <ChapterDrawer
            bookId={editing.id}
            open={chapterDrawerOpen}
            onClose={() => setChapterDrawerOpen(false)}
            editing={editingChapter}
            onSaved={() => refreshChapters(editing.id)}
          />
        )}
      </Drawer>
    </div>
  );
}
