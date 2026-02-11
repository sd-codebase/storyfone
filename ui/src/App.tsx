import { ConfigProvider, theme } from 'antd';
import { darkTheme } from './styles/theme';
import AppLayout from './components/layout/AppLayout';
import LoginScreen from './components/auth/LoginScreen';
import { useAuthStore } from './store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <ConfigProvider theme={{ ...darkTheme, algorithm: theme.darkAlgorithm }}>
      {isAuthenticated ? <AppLayout /> : <LoginScreen />}
    </ConfigProvider>
  );
}
