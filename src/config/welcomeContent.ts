export interface WelcomeContent {
  greeting: string;
  widgets: {
    weather: { icon: string; condition: string; temp: string; sub: string };
    nowPlaying: {
      label: string;
      song: string;
      artist: string;
      progress: number;
      elapsed: string;
      duration: string;
    };
    intention: { label: string; quote: string; tag: string };
    memory: { label: string; caption: string; imageSrc: string };
  };
  poemFooter: string;
  dockTiles: DockTile[];
}

export interface DockTile {
  id: string;
  label: string;
  appId: string | null;
  gradient: [string, string];
  glyph: string;
}

export const GHIBLI_WELCOME: WelcomeContent = {
  greeting: 'Good evening, traveller',
  widgets: {
    weather: {
      icon: '🍃',
      condition: 'Gentle breeze',
      temp: '18°',
      sub: 'clear skies / over the meadow',
    },
    nowPlaying: {
      label: 'NOW PLAYING',
      song: 'The Path of the Wind',
      artist: 'Joe Hisaishi · My Neighbor Totoro',
      progress: 38,
      elapsed: '1:24',
      duration: '3:42',
    },
    intention: {
      label: "TODAY'S INTENTION",
      quote: 'Plant one idea. Water it twice.',
      tag: '🌱 in progress',
    },
    memory: {
      label: 'A MEMORY',
      caption: 'Last evening, in the meadow',
      imageSrc: '/images/worlds/ghibli/wallpaper.webp',
    },
  },
  poemFooter: 'the spirit garden remembers every visitor',
  dockTiles: [
    { id: 'grove',      label: 'Grove',     appId: 'filemanager', gradient: ['#5a9268', '#3f6e4c'], glyph: '🌿' },
    { id: 'atelier',    label: 'Atelier',   appId: 'gallery',     gradient: ['#7fb08a', '#4a7c59'], glyph: '🖼️' },
    { id: 'almanac',    label: 'Almanac',   appId: 'journal',     gradient: ['#8aab6e', '#5a7a44'], glyph: '📖' },
    { id: 'letters',    label: 'Letters',   appId: 'mail',        gradient: ['#6fa880', '#4a7c59'], glyph: '✉️' },
    { id: 'whisperwell',label: 'Whisperwell',appId: 'whisperwell', gradient: ['#5a9268', '#3f6e4c'], glyph: '🌀' },
    { id: 'compass',    label: 'Compass',   appId: 'terminal',    gradient: ['#7fb08a', '#4a7c59'], glyph: '🧭' },
  ],
};
