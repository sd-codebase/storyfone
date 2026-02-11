import { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { nanoid } from 'nanoid';
import { ElementType } from '../../types/script';
import type { SceneElement } from '../../types/script';
import { useStore } from '../../store';

interface Props {
  open: boolean;
  sceneId: string;
  insertIndex: number;
  onClose: () => void;
}

export default function AddElementModal({ open, sceneId, insertIndex, onClose }: Props) {
  const [form] = Form.useForm();
  const addElement = useStore((s) => s.addElement);
  const characters = useStore((s) => s.chapter?.characters ?? []);
  const [elementType, setElementType] = useState<ElementType>(ElementType.DIALOGUE);

  const handleOk = () => {
    form.validateFields().then((values) => {
      let element: SceneElement;

      if (values.type === ElementType.DIALOGUE) {
        element = {
          id: nanoid(),
          type: ElementType.DIALOGUE,
          characterName: values.characterName,
          stageDirection: values.stageDirection ?? '',
          dialogueText: values.dialogueText ?? '',
          language: values.language ?? 'mr',
          order: insertIndex,
          processingStatus: 'pending',
        };
      } else if (values.type === ElementType.PAUSE) {
        element = {
          id: nanoid(),
          type: ElementType.PAUSE,
          duration: values.duration ?? 1,
          order: insertIndex,
        };
      } else {
        element = {
          id: nanoid(),
          type: values.type,
          description: values.description ?? '',
          timing: {
            duration: values.duration,
            fade_in: values.fadeIn,
            fade_out: values.fadeOut,
          },
          order: insertIndex,
        };
      }

      addElement(sceneId, element, insertIndex);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title="Add Element"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose(); }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ type: ElementType.DIALOGUE, language: 'mr' }}>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select onChange={(val) => setElementType(val)}>
            <Select.Option value={ElementType.DIALOGUE}>Dialogue</Select.Option>
            <Select.Option value={ElementType.SFX}>SFX</Select.Option>
            <Select.Option value={ElementType.BGM}>BGM</Select.Option>
            <Select.Option value={ElementType.PAUSE}>Pause</Select.Option>
          </Select>
        </Form.Item>

        {elementType === ElementType.DIALOGUE ? (
          <>
            <Form.Item name="characterName" label="Character" rules={[{ required: true }]}>
              <Select>
                {characters.map((c) => (
                  <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="stageDirection" label="Stage Direction">
              <Input placeholder="e.g., गूढ आवाजात" />
            </Form.Item>
            <Form.Item name="dialogueText" label="Dialogue Text" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="language" label="Language">
              <Select>
                <Select.Option value="mr">Marathi</Select.Option>
                <Select.Option value="hi">Hindi</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
            </Form.Item>
          </>
        ) : elementType === ElementType.PAUSE ? (
          <Form.Item name="duration" label="Duration (seconds)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          <>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input placeholder="e.g., Heavy rain falling" />
            </Form.Item>
            <Form.Item name="duration" label="Duration (seconds)">
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="fadeIn" label="Fade In (seconds)">
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="fadeOut" label="Fade Out (seconds)">
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
