import { Typography, Collapse } from 'antd';
import { useStore } from '../../store';
import ChapterInfoPanel from '../editor/ChapterInfoPanel';
import CharacterList from '../editor/CharacterList';
import ScenePanel from '../editor/ScenePanel';
import JsonPreview from '../editor/JsonPreview';

export default function ParsedView() {
  const chapter = useStore((s) => s.chapter);
  const activeSceneId = useStore((s) => s.activeSceneId);

  if (!chapter) {
    return <Typography.Text type="secondary">No parsed data. Go back to Step 1.</Typography.Text>;
  }

  const activeScene = chapter.scenes.find((s) => s.id === activeSceneId) ?? chapter.scenes[0];

  return (
    <div>
      <ChapterInfoPanel />

      <Collapse
        items={[{
          key: 'characters',
          label: `Characters (${chapter.characters.length})`,
          children: <CharacterList />,
        }]}
        style={{ marginBottom: 16 }}
        defaultActiveKey={[]}
      />

      {activeScene && <ScenePanel scene={activeScene} />}

      <JsonPreview />
    </div>
  );
}
