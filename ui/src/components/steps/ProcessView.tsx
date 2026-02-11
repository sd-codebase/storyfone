import { useState, useCallback } from 'react';
import { Table, Button, Progress, Tag, Space, Typography, Card } from 'antd';
import { PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useStore } from '../../store';
import { processDialogue } from '../../api/client';
import { ElementType } from '../../types/script';
import type { DialogueElement, ProcessingStatus } from '../../types/script';

interface DialogueRow {
  sceneId: string;
  sceneNumber: number;
  element: DialogueElement;
}

const STATUS_TAG: Record<ProcessingStatus, { color: string; label: string }> = {
  pending: { color: 'default', label: 'Pending' },
  processing: { color: 'processing', label: 'Processing' },
  completed: { color: 'success', label: 'Completed' },
  error: { color: 'error', label: 'Error' },
};

export default function ProcessView() {
  const chapter = useStore((s) => s.chapter);
  const updateDialogueStatus = useStore((s) => s.updateDialogueStatus);
  const addDialogueVariation = useStore((s) => s.addDialogueVariation);
  const [processing, setProcessing] = useState(false);

  const dialogues: DialogueRow[] = [];
  if (chapter) {
    for (const scene of chapter.scenes) {
      for (const el of scene.elements) {
        if (el.type === ElementType.DIALOGUE) {
          dialogues.push({ sceneId: scene.id, sceneNumber: scene.sceneNumber, element: el });
        }
      }
    }
  }

  const completedCount = dialogues.filter((d) => d.element.processingStatus === 'completed').length;
  const errorCount = dialogues.filter((d) => d.element.processingStatus === 'error').length;
  const progressPercent = dialogues.length > 0 ? Math.round((completedCount / dialogues.length) * 100) : 0;

  const characterMap = new Map(
    chapter?.characters.map((c) => [c.name, c]) ?? [],
  );

  const processAll = useCallback(async () => {
    if (!chapter) return;
    setProcessing(true);

    for (const row of dialogues) {
      if (row.element.processingStatus === 'completed') continue;

      const ttsId = `${row.element.id}_${Date.now()}`;
      updateDialogueStatus(row.sceneId, row.element.id, 'processing');

      try {
        const result = await processDialogue({
          dialogueId: ttsId,
          characterName: row.element.characterName,
          voiceStyle: characterMap.get(row.element.characterName)?.defaultVoiceStyle ?? '',
          dialogueText: row.element.dialogueText,
          stageDirection: row.element.stageDirection,
          language: row.element.language,
          speakers: (chapter?.characters ?? []).map((c) => ({
            name: c.name,
            voiceName: c.voiceName,
            pitch: c.pitch ?? '0st',
            rate: c.rate ?? '1.0',
            volume: c.volume ?? 'medium',
          })),
        });

        if (result.status === 'completed') {
          addDialogueVariation(row.sceneId, row.element.id, ttsId);
        } else {
          updateDialogueStatus(row.sceneId, row.element.id, 'error');
        }
      } catch {
        updateDialogueStatus(row.sceneId, row.element.id, 'error');
      }
    }

    setProcessing(false);
  }, [chapter, dialogues, updateDialogueStatus, addDialogueVariation, characterMap]);

  const columns = [
    {
      title: 'Scene',
      dataIndex: 'sceneNumber',
      key: 'scene',
      width: 80,
    },
    {
      title: 'Character',
      key: 'character',
      width: 150,
      render: (_: unknown, row: DialogueRow) => row.element.characterName,
    },
    {
      title: 'Dialogue',
      key: 'dialogue',
      ellipsis: true,
      render: (_: unknown, row: DialogueRow) => (
        <span style={{ fontSize: 13 }}>{row.element.dialogueText.slice(0, 80)}...</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_: unknown, row: DialogueRow) => {
        const status = row.element.processingStatus ?? 'pending';
        const tag = STATUS_TAG[status];
        return <Tag color={tag.color}>{tag.label}</Tag>;
      },
    },
  ];

  if (!chapter) {
    return <Typography.Text type="secondary">No data to process.</Typography.Text>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Typography.Title level={4}>Audio Processing</Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Typography.Text>
              {dialogues.length} dialogues total | {completedCount} completed | {errorCount} errors
            </Typography.Text>
          </Space>
          <Progress percent={progressPercent} status={errorCount > 0 ? 'exception' : undefined} />
          <Button
            type="primary"
            size="large"
            icon={processing ? <SyncOutlined spin /> : <PlayCircleOutlined />}
            loading={processing}
            onClick={processAll}
          >
            {processing ? 'Processing...' : 'Process All Dialogues'}
          </Button>
        </Space>
      </Card>

      <Table
        dataSource={dialogues}
        columns={columns}
        rowKey={(row) => row.element.id}
        pagination={false}
        size="small"
      />
    </div>
  );
}
