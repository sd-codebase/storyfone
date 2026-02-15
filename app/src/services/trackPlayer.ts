import TrackPlayer, { Capability, Event, IOSCategoryMode, IOSCategory } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer({
    iosCategoryMode: IOSCategoryMode.SpokenAudio,
    iosCategory: IOSCategory.Playback,
  });
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
  });
}

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
    usePlayerStore.getState().setIsPlaying(false);
  });
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
    usePlayerStore.getState().setIsPlaying(true);
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
    TrackPlayer.seekTo(e.position);
    usePlayerStore.getState().setCurrentTime(e.position);
  });
}
