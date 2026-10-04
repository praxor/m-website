export type MusicTrack = {
  title?: string;
  artist?: string;
  src?: string;
  duration?: string;
};

export type MusicPlaylist = {
  name?: string;
  description?: string;
  tracks?: MusicTrack[];
};

const playlistRequests = new Map<string, Promise<MusicPlaylist>>();

export const loadMusicPlaylist = (source: string): Promise<MusicPlaylist> => {
  const url = new URL(source, document.baseURI).href;
  const cached = playlistRequests.get(url);
  if (cached) return cached;

  const request = fetch(url, { cache: 'no-cache' })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Playlist request failed: ${response.status}`);
      return await response.json() as MusicPlaylist;
    })
    .catch((error) => {
      playlistRequests.delete(url);
      throw error;
    });

  playlistRequests.set(url, request);
  return request;
};