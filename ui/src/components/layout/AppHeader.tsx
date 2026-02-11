import { Button, Segmented, Steps } from 'antd';
import { FileTextOutlined, EditOutlined, SoundOutlined, LogoutOutlined } from '@ant-design/icons';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import type { AppMode } from '../../store/adminStore';

const AUTH_TOKEN_KEY = 'auth_token';

const stepItems = [
  { title: 'Script Input', icon: <FileTextOutlined /> },
  { title: 'Edit & Review', icon: <EditOutlined /> },
  { title: 'Process Audio', icon: <SoundOutlined /> },
];

export default function AppHeader() {
  const currentStep = useStore((s) => s.currentStep);
  const chapter = useStore((s) => s.chapter);
  const setCurrentStep = useStore((s) => s.setCurrentStep);
  const appMode = useAdminStore((s) => s.appMode);
  const setAppMode = useAdminStore((s) => s.setAppMode);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: '100%' }}>
      <h2 style={{ color: '#e6e6e6', margin: 0, marginRight: 32, whiteSpace: 'nowrap' }}>
        Storyfone
      </h2>
      {appMode === 'editor' && (
        <div className="app-steps" style={{ flex: 1 }}>
          <Steps
            current={currentStep}
            items={stepItems}
            size="small"
            onChange={(step) => {
              if (step === 0 || chapter) {
                setCurrentStep(step as 0 | 1 | 2);
              }
            }}
          />
        </div>
      )}
      {appMode === 'admin' && <div style={{ flex: 1 }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
        <Segmented
          value={appMode}
          options={[
            { label: 'Editor', value: 'editor' },
            { label: 'Admin', value: 'admin' },
          ]}
          onChange={(val) => setAppMode(val as AppMode)}
          size="small"
        />
        <Button
          icon={<LogoutOutlined />}
          size="small"
          type="text"
          style={{ color: '#999' }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
