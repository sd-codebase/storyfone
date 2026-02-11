import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1668dc',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#2a2a2a',
    colorBgLayout: '#141414',
    colorText: '#e6e6e6',
    colorTextSecondary: '#a0a0a0',
    colorBorder: '#424242',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#1a1a2e',
      siderBg: '#1a1a1a',
      bodyBg: '#141414',
    },
    Card: {
      colorBgContainer: '#1f1f1f',
    },
    Table: {
      colorBgContainer: '#1f1f1f',
    },
    Steps: {
      colorPrimary: '#1668dc',
    },
  },
};
