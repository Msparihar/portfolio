// PLACEHOLDER LORE — Replace these entries with your own in-character writing.
// Each world has 4 journal entries. Body paragraphs are separate for spacing.

const JOURNAL_ENTRIES = {
  'elden-ring': [
    {
      title: 'Entry I — The Erdtree Burns',
      date: 'Year 802 — Season of the Scarlet Rot',
      body: [
        "The Great Erdtree, once radiant above the Lands Between, now weeps golden cinders into the ashen sky. I write this from the ruins of Stormveil — my hands still trembling from the Shardbearer’s wrath. The grace that guides me falters with each stride forward, yet I press on.",
        'They call us Tarnished — stripped of grace, forsaken by the Elden Ring itself. Yet here I stand, quill in hand, recording what the scholars dared not: that the fracture was not fate, but folly.',
        '"Let the grace guide thee, Tarnished. To the Lands Between, to the Elden Ring, and to thy destined fate."',
      ],
    },
    {
      title: 'Entry II — The Crumbling Labyrinth',
      date: 'Year 802 — Three Days Hence',
      body: [
        'I ventured into Farum Azula — that crumbling labyrinth suspended above the tempest. The Beastmen there do not know peace, only hunger. Among their bones I found a tome, its pages sealed with dried ichor.',
        "The tome speaks of a mending rune — a shard of the original Elden Ring, scattered beyond the Erdtree's sight. Whether this is hope or heresy I cannot yet discern. I have copied its sigils here, between these parchment leaves, where the Two Fingers cannot reach.",
        'Tomorrow I ride for Leyndell. The capital still stands — barely — its streets choked with soldiers who have forgotten what they guard.',
      ],
    },
    {
      title: 'Entry III — The Fractured Throne',
      date: 'Year 802 — After the Golden Capital',
      body: [
        'Leyndell is ash. I walked the avenues where golden knights once stood sentry, and found only cinders and silence. The Elden Beast stirs beneath the Erdtree\'s roots. I can feel it — a weight behind the eyes, like grief shaped into geometry.',
        'I did not come here for the Elden Ring. I came because someone had to remember. Someone had to write it down.',
        'My fingers are steady now. Whatever comes next — whether I mend the Ring or shatter it further — these pages will outlast us both.',
      ],
    },
    {
      title: 'Entry IV — A Destined Death',
      date: 'Year 802 — The Final Night',
      body: [
        'There is a stillness before the final grace site. No wind. No birdsong. Only the faint luminescence of the Erdtree, which no longer burns — it simply waits.',
        'I leave this journal at the foot of the Erdtree. Not for posterity. For the next Tarnished who stumbles through the fog and needs to know they are not the first.',
        'We are all, in the end, drawn toward the light.',
      ],
    },
  ],

  'ghibli': [
    {
      title: 'The Garden in Rain',
      date: 'Eleventh of Leaffall, Year of the Quiet River',
      body: [
        'It rained all morning, the kind that smells of pine and wet stone. I sat at the edge of the forest and watched the mushrooms open their caps to drink. There is something they know that I am still learning.',
        'Kodama moved through the old cedar today — just a flicker, like a candle behind paper. I did not follow. Some things are not meant to be chased.',
        'Made rice porridge for supper. Added too much ginger. Ate it anyway.',
      ],
    },
    {
      title: 'Letters from the Valley',
      date: 'Third of Windmonth, Year of the Quiet River',
      body: [
        'A letter arrived from the village below. They are worried about the dam on the eastern stream. I will go tomorrow and look, though I suspect the water already knows what to do.',
        'The spirit of the valley is patient. It has been patient for a thousand years. It will be patient a thousand more. I try to hold that patience like a stone in my pocket.',
        'The totoro slept under the camphor tree again. I left an umbrella just in case.',
      ],
    },
    {
      title: 'Seeds and Silence',
      date: 'Seventeenth of Bloomtide',
      body: [
        'Planted radishes along the south wall. Also three varieties of daikon and something I found growing wild at the forest edge — I do not know its name, but it smells like old books and honey.',
        'Spent the afternoon with no particular task. Just sitting. Watching the light move across the floor. This is harder than it sounds.',
        'Evening brought fireflies to the pond. I counted twelve before I stopped counting and just watched.',
      ],
    },
    {
      title: 'The Long Walk Back',
      date: 'First of Harvestmonth',
      body: [
        'Returned from the mountain before dark. The path through the bamboo grove is always shorter on the way back — I have decided not to question this.',
        'Found a fox kit asleep on my doorstep. It woke, looked at me for a long moment, and then vanished into the undergrowth. These things happen here.',
        'There is a word I have been thinking about: ma. The pause between notes. The breath before a word. I think the forest lives entirely inside that pause.',
      ],
    },
  ],

  got: [
    {
      title: 'From the Desk of a Practical Man',
      date: 'The Third Moon, In the Year After the Red Wedding',
      body: [
        'They sent a raven today. Fourteen ravens, in fact. One for each lord who believes the Iron Throne owes him something. I burned twelve of them. The remaining two I have answered with diplomatic ambiguity, which is the Westerosi equivalent of a shrug.',
        "The Small Council meeting lasted three hours and accomplished the sum of nothing. Lord Tyrion opened with a joke about a Lannister, a Stark, and a barrel of Dornish wine. No one laughed. This is the problem with power — it destroys everyone's sense of humor.",
        '"When you play the game of thrones, you win or you die." She forgot the third option: you write it all down so someone can be embarrassed about it later.',
      ],
    },
    {
      title: 'A Field Report from the North',
      date: 'The Fifth Moon — Gods, It\'s Cold',
      body: [
        'The Wall is exactly as unpleasant as described. The brothers of the Night\'s Watch are brave men, I will grant them that. They are also spectacularly poor conversationalists. Three days here and I have learned everything there is to know about the finer points of salted horse.',
        'There is something beyond the Wall. The crows won\'t talk about it directly — they speak around it, the way you speak around a sore tooth. Eyes that catch the wrong light. Footsteps in snow that belong to nothing.',
        'I have begun sleeping with a candle lit. This is not fear. It is merely a sensible precaution.',
      ],
    },
    {
      title: 'King\'s Landing, Annotated',
      date: 'The Ninth Moon — Summer, Allegedly',
      body: [
        'Notes on the capital, for anyone who finds this journal useful: the Small Council lies. The Gold Cloaks lie. The merchants lie with such practiced grace it has become an art form. The sparrows tell the truth, which is somehow worse.',
        'Attended a royal feast. Eleven courses. The last three were the same dish with different garnishes, and no one mentioned it. This is what power looks like from the inside — a surplus of food and a scarcity of honesty.',
        'Cersei watched me across the table for the better part of an hour. I smiled back each time. Survival in King\'s Landing is largely a matter of being slightly more difficult to kill than whoever is standing next to you.',
      ],
    },
    {
      title: 'Final Notation',
      date: 'The Twelfth Moon — Winter Is, Regrettably, Here',
      body: [
        'The snows came early this year. I have moved my ink closer to the fire to keep it from freezing. The ravens are slower in cold weather; so are the ravens, for that matter.',
        'I have kept this journal because someone in this kingdom ought to be keeping records that are not propaganda. History, as usually written, is the story of who won. I would prefer a story of who noticed.',
        'The North remembers. So, it turns out, do I.',
      ],
    },
  ],
};

export default JOURNAL_ENTRIES;
