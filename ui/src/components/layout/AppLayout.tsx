import { Layout } from 'antd';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
import ScriptInput from '../steps/ScriptInput';
import ParsedView from '../steps/ParsedView';
import ProcessView from '../steps/ProcessView';
import AdminLayout from '../admin/AdminLayout';

const { Header, Sider, Content } = Layout;

function StepContent() {
  const currentStep = useStore((s) => s.currentStep);

  switch (currentStep) {
    case 0:
      return <ScriptInput />;
    case 1:
      return <ParsedView />;
    case 2:
      return <ProcessView />;
    default:
      return <ScriptInput />;
  }
}

export default function AppLayout() {
  const currentStep = useStore((s) => s.currentStep);
  const appMode = useAdminStore((s) => s.appMode);
  const showSider = appMode === 'editor' && currentStep === 1;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ height: 64, lineHeight: '64px', padding: 0, borderBottom: '1px solid #303030' }}>
        <AppHeader />
      </Header>
      <Layout>
        {appMode === 'editor' ? (
          <>
            {showSider && (
              <Sider
                width={220}
                style={{ borderRight: '1px solid #303030', overflow: 'auto' }}
              >
                <AppSider />
              </Sider>
            )}
            <Content style={{ padding: 24, overflow: 'auto' }}>
              <StepContent />
            </Content>
          </>
        ) : (
          <AdminLayout />
        )}
      </Layout>
    </Layout>
  );
}
