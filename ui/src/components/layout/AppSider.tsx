import { Typography } from 'antd';
import { useStore } from '../../store';

export default function AppSider() {
  const chapter = useStore((s) => s.chapter);
  const activeSceneId = useStore((s) => s.activeSceneId);
  const setActiveSceneId = useStore((s) => s.setActiveSceneId);

  if (!chapter) return null;

  return (
    <div style={{ padding: '16px 8px' }}>
      <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '0 8px' }}>
        Scenes
      </Typography.Text>
      <div style={{ marginTop: 12 }}>
        {chapter.scenes.map((scene) => (
          <div
            key={scene.id}
            className={`scene-nav-item ${activeSceneId === scene.id ? 'active' : ''}`}
            onClick={() => setActiveSceneId(scene.id)}
          >
            <div style={{ fontWeight: 500, fontSize: 13 }}>
              Scene {scene.sceneNumber}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {scene.title}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              {scene.elements.length} elements
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
