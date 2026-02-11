import { Layout, Menu } from 'antd';
import {
  GlobalOutlined,
  TagsOutlined,
  UserOutlined,
  AudioOutlined,
  TeamOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useAdminStore } from '../../store/adminStore';
import type { AdminSection } from '../../store/adminStore';
import LanguagesPage from './pages/LanguagesPage';
import GenresPage from './pages/GenresPage';
import AuthorsPage from './pages/AuthorsPage';
import NarratorsPage from './pages/NarratorsPage';
import UsersPage from './pages/UsersPage';
import BooksPage from './pages/BooksPage';

const { Sider, Content } = Layout;

const menuItems = [
  { key: 'languages', icon: <GlobalOutlined />, label: 'Languages' },
  { key: 'genres', icon: <TagsOutlined />, label: 'Genres' },
  { key: 'authors', icon: <UserOutlined />, label: 'Authors' },
  { key: 'narrators', icon: <AudioOutlined />, label: 'Narrators' },
  { key: 'books', icon: <BookOutlined />, label: 'Books' },
  { key: 'users', icon: <TeamOutlined />, label: 'Users' },
];

function SectionContent({ section }: { section: AdminSection }) {
  switch (section) {
    case 'languages':
      return <LanguagesPage />;
    case 'genres':
      return <GenresPage />;
    case 'authors':
      return <AuthorsPage />;
    case 'narrators':
      return <NarratorsPage />;
    case 'users':
      return <UsersPage />;
    case 'books':
      return <BooksPage />;
  }
}

export default function AdminLayout() {
  const activeSection = useAdminStore((s) => s.activeSection);
  const setActiveSection = useAdminStore((s) => s.setActiveSection);

  return (
    <Layout style={{ height: '100%' }}>
      <Sider width={200} style={{ borderRight: '1px solid #303030', overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          items={menuItems}
          style={{ height: '100%' }}
          onClick={({ key }) => setActiveSection(key as AdminSection)}
        />
      </Sider>
      <Content style={{ padding: 24, overflow: 'auto' }}>
        <SectionContent section={activeSection} />
      </Content>
    </Layout>
  );
}
