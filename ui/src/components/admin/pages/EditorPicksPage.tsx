import { useEffect, useState } from 'react';
import { Table, Button, Modal, Select, App, Typography, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { EditorPick, Language, Book } from '../../../types/admin';
import { editorPicksApi, languagesApi, booksApi } from '../../../api/client';

const { Title } = Typography;

export default function EditorPicksPage() {
  const [picks, setPicks] = useState<EditorPick[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLang, setEditLang] = useState<Language | null>(null);
  const [sfwId, setSfwId] = useState<string | null>(null);
  const [adultId, setAdultId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, l, b] = await Promise.all([
        editorPicksApi.list(),
        languagesApi.list(),
        booksApi.list(),
      ]);
      setPicks(p);
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

  const pickMap = new Map(picks.map((p) => [p.language, p]));
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const sfwBooks = books.filter((b) => !b.is_adult);
  const adultBooks = books.filter((b) => b.is_adult);
  // If no adult books exist, allow picking any book for 18+ slot
  const adultOptions = adultBooks.length > 0 ? adultBooks : books;

  // Show all languages, merged with existing picks
  const rows = languages.map((lang) => {
    const pick = pickMap.get(lang.id);
    return {
      key: lang.id,
      language: lang,
      pick,
    };
  });

  const openEdit = (lang: Language) => {
    const pick = pickMap.get(lang.id);
    setEditLang(lang);
    setSfwId(pick?.book_id_sfw ?? null);
    setAdultId(pick?.book_id_adult ?? null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editLang) return;
    if (!sfwId) {
      message.warning('Please select a SFW book');
      return;
    }
    setSaving(true);
    try {
      await editorPicksApi.set(editLang.id, sfwId, adultId);
      message.success('Editor pick saved');
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Failed to save editor pick');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Language',
      key: 'language',
      render: (_: unknown, row: (typeof rows)[0]) => row.language.name,
    },
    {
      title: 'Book (SFW)',
      key: 'sfw',
      render: (_: unknown, row: (typeof rows)[0]) => {
        if (!row.pick?.book_id_sfw) return <Tag>Not set</Tag>;
        const b = bookMap.get(row.pick.book_id_sfw);
        return b ? b.title : row.pick.book_id_sfw;
      },
    },
    {
      title: 'Book (18+)',
      key: 'adult',
      render: (_: unknown, row: (typeof rows)[0]) => {
        if (!row.pick?.book_id_adult) return <Tag>Not set</Tag>;
        const b = bookMap.get(row.pick.book_id_adult);
        return b ? b.title : row.pick.book_id_adult;
      },
    },
    {
      title: 'Updated',
      key: 'updated_at',
      render: (_: unknown, row: (typeof rows)[0]) =>
        row.pick?.updated_at ? new Date(row.pick.updated_at).toLocaleDateString() : '—',
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
      <Title level={4}>Editor Picks</Title>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={`Editor Pick — ${editLang?.name ?? ''}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" loading={saving} disabled={!sfwId} onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Book (SFW) *
          </label>
          <Select
            showSearch
            value={sfwId}
            onChange={(val) => setSfwId(val)}
            placeholder="Select a book"
            style={{ width: '100%' }}
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={sfwBooks.map((b) => ({ value: b.id, label: b.title }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Book (18+)
          </label>
          <Select
            showSearch
            allowClear
            value={adultId}
            onChange={(val) => setAdultId(val ?? null)}
            placeholder="Select a book (optional)"
            style={{ width: '100%' }}
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={adultOptions.map((b) => ({ value: b.id, label: b.title }))}
          />
        </div>
      </Modal>
    </>
  );
}
