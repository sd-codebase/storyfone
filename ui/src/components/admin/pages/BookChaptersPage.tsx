import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Progress,
  Space,
  Tag,
  Upload,
  message,
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import type { UploadFile as AntUploadFile } from 'antd/es/upload';
import { API_BASE, chaptersApi } from '../../../api/client';
import type { Chapter } from '../../../types/admin';
import { UploadCategory } from '../../../api/upload';
import { useFileUpload } from '../../../hooks/useFileUpload';

interface ChapterDrawerProps {
  bookId: string;
  open: boolean;
  onClose: () => void;
  editing: Chapter | null;
  onSaved: () => void;
}

export default function ChapterDrawer({ bookId, open, onClose, editing, onSaved }: ChapterDrawerProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const thumbnail = useFileUpload({ category: UploadCategory.CHAPTER_THUMBNAIL, maxSizeKb: 250 });
  const audio = useFileUpload({ category: UploadCategory.CHAPTER_AUDIO });

  const hasPendingUploads = (thumbnail.file && !thumbnail.uploaded) || (audio.file && !audio.uploaded);

  const resetState = useCallback(() => {
    thumbnail.clear();
    audio.clear();
    setSaving(false);
  }, [thumbnail, audio]);

  useEffect(() => {
    if (!open) return;
    resetState();
    if (editing) {
      form.setFieldsValue({ name: editing.name });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const fields: Record<string, unknown> = { ...values };
      if (thumbnail.result) fields.thumbnail_url = thumbnail.result.url;
      if (audio.result) fields.audio_raw = audio.result.path;

      if (editing) {
        await chaptersApi.update(bookId, editing.id, fields);
        message.success('Chapter updated');
      } else {
        await chaptersApi.create(bookId, fields);
        message.success('Chapter created');
      }

      setSaving(false);
      onSaved();
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={editing ? 'Edit Chapter' : 'Add Chapter'}
      placement="right"
      width={480}
      open={open}
      onClose={() => !saving && onClose()}
      extra={
        <Space>
          <Button onClick={() => !saving && onClose()} disabled={saving}>
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
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
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

        <Form.Item label="Audio">
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
            {editing?.audio_raw && !audio.file && (
              <Tag icon={<CheckCircleOutlined />} color="blue">Current audio uploaded</Tag>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
