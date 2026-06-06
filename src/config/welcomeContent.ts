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
  shadowTint?: string;
  gloss?: boolean;
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
      // user-supplied photo placeholder — swap this asset to personalise the memory widget
      imageSrc: '/images/welcome/memory-placeholder.webp',
    },
  },
  poemFooter: 'the spirit garden remembers every visitor',
  dockTiles: [
    { id: 'grove',       label: 'Grove',       appId: 'filemanager', gradient: ['#5fd97a', '#2ea84f'], shadowTint: '#2ea84f', gloss: true, glyph: '🌿' },
    { id: 'compass',     label: 'Compass',     appId: 'terminal',    gradient: ['#3ad9c4', '#0e9488'], shadowTint: '#0e9488', gloss: true, glyph: '🧭' },
    { id: 'letters',     label: 'Letters',     appId: 'mail',        gradient: ['#ff8a7a', '#ef4e3a'], shadowTint: '#ef4e3a', gloss: true, glyph: '✉️' },
    { id: 'almanac',     label: 'Almanac',     appId: 'journal',     gradient: ['#ffc24d', '#f0921d'], shadowTint: '#f0921d', gloss: true, glyph: '📖' },
    { id: 'atelier',     label: 'Atelier',     appId: 'gallery',     gradient: ['#c08cf5', '#8b3fe0'], shadowTint: '#8b3fe0', gloss: true, glyph: '🖼️' },
    { id: 'whisperwell', label: 'Whisperwell', appId: 'whisperwell', gradient: ['#5bb8f5', '#1f7fd6'], shadowTint: '#1f7fd6', gloss: true, glyph: '🌀' },
    { id: 'about',       label: 'About',       appId: 'about',       gradient: ['#e8c87a', '#c9a050'], shadowTint: '#c9a050', gloss: true, glyph: '👤' },
    { id: 'resume',      label: 'Resume',      appId: 'resume',      gradient: ['#8cc4b8', '#5a8c84'], shadowTint: '#5a8c84', gloss: true, glyph: '📄' },
  ],
};
