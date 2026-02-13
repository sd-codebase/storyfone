import { useEffect, useState } from 'react';
import { Table, Button, Modal, Select, App, Typography, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { TrendingList, Language, Book } from '../../../types/admin';
import { trendingApi, languagesApi, booksApi } from '../../../api/client';

const { Title } = Typography;
const MAX_PER_LIST = 10;

export default function TrendingPage() {
  const [trending, setTrending] = useState<TrendingList[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLang, setEditLang] = useState<Language | null>(null);
  const [sfwIds, setSfwIds] = useState<string[]>([]);
  const [adultIds, setAdultIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, l, b] = await Promise.all([
        trendingApi.list(),
        languagesApi.list(),
        booksApi.list(),
      ]);
      setTrending(t);
      setLanguages(l);
      setBooks(b);
    } catch {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trendingMap = new Map(trending.map((t) => [t.language, t]));
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const sfwBooks = books.filter((b) => !b.is_adult);
  const adultBooks = books.filter((b) => b.is_adult);
  const adultOptions = adultBooks.length > 0 ? adultBooks : books;

  const rows = languages.map((lang) => {
    const tr = trendingMap.get(lang.id);
    return { key: lang.id, language: lang, trending: tr };
  });

  const openEdit = (lang: Language) => {
    const tr = trendingMap.get(lang.id);
    setEditLang(lang);
    setSfwIds(tr?.book_ids_sfw ?? []);
    setAdultIds(tr?.book_ids_adult ?? []);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editLang) return;
    setSaving(true);
    try {
      await trendingApi.set(editLang.id, sfwIds, adultIds);
      message.success('Trending list saved');
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Failed to save trending list');
    } finally {
      setSaving(false);
    }
  };

  const renderBookNames = (ids: string[]) => {
    if (!ids.length) return <Tag>Not set</Tag>;
    return ids
      .map((id) => bookMap.get(id)?.title ?? id)
      .join(', ');
  };

  const columns = [
    {
      title: 'Language',
      key: 'language',
      render: (_: unknown, row: (typeof rows)[0]) => row.language.name,
    },
    {
      title: 'SFW Books',
      key: 'sfw',
      render: (_: unknown, row: (typeof rows)[0]) => {
        const ids = row.trending?.book_ids_sfw ?? [];
        return ids.length ? <Tag color="green">{ids.length}</Tag> : <Tag>0</Tag>;
      },
    },
    {
      title: '18+ Books',
      key: 'adult',
      render: (_: unknown, row: (typeof rows)[0]) => {
        const ids = row.trending?.book_ids_adult ?? [];
        return ids.length ? <Tag color="red">{ids.length}</Tag> : <Tag>0</Tag>;
      },
    },
    {
      title: 'Updated',
      key: 'updated_at',
      render: (_: unknown, row: (typeof rows)[0]) =>
        row.trending?.updated_at
          ? new Date(row.trending.updated_at).toLocaleDateString()
          : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: unknown, row: (typeof rows)[0]) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row.language)} />
      ),
    },
  ];

  return (
    <>
      <Title level={4}>Trending</Title>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={`Trending — ${editLang?.name ?? ''}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={600}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            SFW Books (max {MAX_PER_LIST})
          </label>
          <Select
            mode="multiple"
            showSearch
            value={sfwIds}
            onChange={(val) => setSfwIds(val.slice(0, MAX_PER_LIST))}
            placeholder="Select up to 10 books"
            style={{ width: '100%' }}
            maxCount={MAX_PER_LIST}
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={sfwBooks.map((b) => ({ value: b.id, label: b.title }))}
          />
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {sfwIds.length} / {MAX_PER_LIST} selected
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            18+ Books (max {MAX_PER_LIST})
          </label>
          <Select
            mode="multiple"
            showSearch
            value={adultIds}
            onChange={(val) => setAdultIds(val.slice(0, MAX_PER_LIST))}
            placeholder="Select up to 10 books"
            style={{ width: '100%' }}
            maxCount={MAX_PER_LIST}
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={adultOptions.map((b) => ({ value: b.id, label: b.title }))}
          />
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {adultIds.length} / {MAX_PER_LIST} selected
          </div>
        </div>
      </Modal>
    </>
  );
}
