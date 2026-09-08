PLAYLIST GUIDE

1. Copy all.json and give it a new name, such as rainy.json.
2. Put the audio file in public/musicplayer/music/.
3. Add one track object for each song:

{
  "title": "song title",
  "src": "/musicplayer/music/song-file.mp3"
}

4. Add a matching playlist button in src/pages/music.astro:
   - Set data-playlist-url to /musicplayer/playlists/rainy.json.
   - Set data-playlist-name to rainy.playlist.
   - Put the button inside the folder where it should appear.

The visible .playlist labels on the music page are just buttons. The JSON files are the real playlists.

To remove a playlist, delete its JSON file and remove its matching button from src/pages/music.astro.

The player itself currently opens all.json by default. To change its default playlist, edit data-playlist-url in src/components/MusicPlayer.astro.

Playlist manifests are fetched with cache disabled, so edits appear after refreshing the page.
