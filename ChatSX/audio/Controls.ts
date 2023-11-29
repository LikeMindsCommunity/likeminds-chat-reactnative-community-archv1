import TrackPlayer, {AddTrack} from 'react-native-track-player';
import {setupPlayer} from './TrackPlayerServices';
import {AUDIO_NOTIFICATION_TITLE} from '../constants/Strings';

// to add track in queue so that we can play it
export async function addTracks(track: AddTrack) {
  await TrackPlayer.add([track]);
}

// to start audio player
export const startPlay = async (path: string, url: string) => {
  const isSetup = await setupPlayer();

  const track = {
    id: '1',
    url: path,
    title: AUDIO_NOTIFICATION_TITLE,
    externalUrl: url,
  };
  if (isSetup) {
    await TrackPlayer.reset();
    await addTracks(track);

    await TrackPlayer.play();

    return true;
  } else {
    return false;
  }
};

// to stop playing audio recording
export const stopPlay = async () => {
  await TrackPlayer.stop();
  await TrackPlayer.reset();
  return false;
};

// to pause playing audio recording
export const onPausePlay = async () => {
  await TrackPlayer.pause();
  return false;
};

// to resume playing audio recording
export const onResumePlay = async () => {
  await TrackPlayer.play();
  return true;
};

// seek to player on provided seconds
export const onSeekTo = async (seconds: number) => {
  await TrackPlayer.seekTo(seconds);
};
