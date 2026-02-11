import { useState } from 'react';
import { Input, Button, Upload, Card, Alert, Space, Typography } from 'antd';
import { UploadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { parseScript } from '../../parser';
import { useStore } from '../../store';

const { TextArea } = Input;

export default function ScriptInput() {
  const rawScript = useStore((s) => s.rawScript);
  const parseError = useStore((s) => s.parseError);
  const setRawScript = useStore((s) => s.setRawScript);
  const setChapter = useStore((s) => s.setChapter);
  const setParseError = useStore((s) => s.setParseError);
  const setCurrentStep = useStore((s) => s.setCurrentStep);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    if (!rawScript.trim()) {
      setParseError('Please paste or upload a script first.');
      return;
    }

    setLoading(true);
    try {
      const chapter = parseScript(rawScript);
      setChapter(chapter);
      setCurrentStep(1);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse script');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: UploadFile) => {
    const rawFile = file as unknown as File;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setRawScript(text);
        setParseError(null);
      }
    };
    reader.readAsText(rawFile);
    return false; // prevent default upload
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        Paste or Upload Script
      </Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Upload.Dragger
            accept=".txt"
            showUploadList={false}
            beforeUpload={handleFileUpload}
            style={{ marginBottom: 8 }}
          >
            <p style={{ fontSize: 16 }}>
              <UploadOutlined style={{ marginRight: 8 }} />
              Click or drag a <code>.txt</code> script file here
            </p>
          </Upload.Dragger>

          <TextArea
            value={rawScript}
            onChange={(e) => {
              setRawScript(e.target.value);
              setParseError(null);
            }}
            placeholder="Or paste your script text here..."
            autoSize={{ minRows: 12, maxRows: 24 }}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />

          {parseError && (
            <Alert type="error" message={parseError} showIcon closable onClose={() => setParseError(null)} />
          )}

          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            loading={loading}
            onClick={handleParse}
            disabled={!rawScript.trim()}
          >
            Parse Script
          </Button>
        </Space>
      </Card>
    </div>
  );
}
