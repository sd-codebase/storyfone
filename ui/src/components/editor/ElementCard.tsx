import { ElementType } from '../../types/script';
import type { SceneElement, DialogueElement } from '../../types/script';
import DialogueCard from './DialogueCard';
import SfxCard from './SfxCard';
import BgmCard from './BgmCard';
import PauseCard from './PauseCard';

interface Props {
  element: SceneElement;
  sceneId: string;
  onGenerate?: (element: DialogueElement) => void;
  isGenerating?: boolean;
}

export default function ElementCard({ element, sceneId, onGenerate, isGenerating }: Props) {
  switch (element.type) {
    case ElementType.DIALOGUE:
      return (
        <DialogueCard
          element={element}
          sceneId={sceneId}
          onGenerate={onGenerate ?? (() => {})}
          generating={isGenerating ?? false}
        />
      );
    case ElementType.SFX:
      return <SfxCard element={element} sceneId={sceneId} />;
    case ElementType.BGM:
      return <BgmCard element={element} sceneId={sceneId} />;
    case ElementType.PAUSE:
      return <PauseCard element={element} sceneId={sceneId} />;
    default:
      return null;
  }
}
