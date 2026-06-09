export interface WeatherForecastEntry {
  time: string;
  temp: string;
  note: string;
}

export interface WeatherWidgetData {
  icon: string;
  condition: string;
  temp: string;
  sub: string;
  forecast?: WeatherForecastEntry[];
  skyNote?: string;
}

export interface NowPlayingWidgetData {
  label: string;
  song: string;
  artist: string;
  progress: number;
  elapsed: string;
  duration: string;
  playlist?: string[];
}

export interface IntentionWidgetData {
  label: string;
  quote: string;
  tag: string;
  reflection?: string;
  tasks?: { text: string; done: boolean }[];
}

export interface MemoryWidgetData {
  label: string;
  caption: string;
  imageSrc: string;
  story?: string;
}

export interface WelcomeContent {
  greeting: string;
  widgets: {
    weather: WeatherWidgetData;
    nowPlaying: NowPlayingWidgetData;
    intention: IntentionWidgetData;
    memory: MemoryWidgetData;
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
      forecast: [
        { time: 'now',  temp: '18°', note: 'gentle breeze' },
        { time: 'dusk', temp: '16°', note: 'still air' },
        { time: 'night', temp: '14°', note: 'fireflies wake' },
        { time: 'dawn', temp: '13°', note: 'dew on the grass' },
      ],
      skyNote: 'clear skies — the tall grass leans west',
    },
    nowPlaying: {
      label: 'NOW PLAYING',
      song: 'The Path of the Wind',
      artist: 'Joe Hisaishi · My Neighbor Totoro',
      progress: 38,
      elapsed: '1:24',
      duration: '3:42',
      playlist: [
        'One Summer\'s Day — Spirited Away',
        'Nausicaä Requiem — Nausicaä',
        'Merry-Go-Round of Life — Howl\'s Moving Castle',
        'Princess Mononoke — Princess Mononoke',
      ],
    },
    intention: {
      label: "TODAY'S INTENTION",
      quote: 'Plant one idea. Water it twice.',
      tag: '🌱 in progress',
      reflection: 'Even the oldest oak was once a seed resting in still earth.',
      tasks: [
        { text: 'Plant one idea', done: true },
        { text: 'Water it', done: false },
        { text: 'Let it rest', done: false },
      ],
    },
    memory: {
      label: 'A MEMORY',
      caption: 'Last evening, in the meadow',
      imageSrc: '/images/welcome/memory-placeholder.webp',
      story: 'Last evening the little fox sat on the old shrine post and watched the clouds turn gold. You stayed until the first firefly.',
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
