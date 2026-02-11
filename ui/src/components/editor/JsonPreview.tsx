import { Drawer, Button } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useStore } from '../../store';

export default function JsonPreview() {
  const chapter = useStore((s) => s.chapter);
  const [open, setOpen] = useState(false);

  if (!chapter) return null;

  return (
    <>
      <Button
        icon={<CodeOutlined />}
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}
      >
        JSON Preview
      </Button>
      <Drawer
        title="JSON Output"
        placement="bottom"
        height="60vh"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="json-preview">
          <pre>{JSON.stringify(chapter, null, 2)}</pre>
        </div>
      </Drawer>
    </>
  );
}
