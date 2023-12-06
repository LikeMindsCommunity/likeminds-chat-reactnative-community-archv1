import TrackPlayer, {Event} from 'react-native-track-player';

export async function setupPlayer() {
  let isSetup = false;
  try {
    await TrackPlayer.getActiveTrack();
    isSetup = true;
    return isSetup;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions();

    isSetup = true;
    return isSetup;
  } finally {
    return isSetup;
  }
}

export async function playbackService() {
  // to pause audio from notification
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  // to play audio from notification
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });
}
