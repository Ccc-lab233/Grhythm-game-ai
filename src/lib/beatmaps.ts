// Beat map definitions for the rhythm game
// Each note: { time: ms, lane: 0-3 (A,S,D,F) }

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface NoteData {
  time: number; // in milliseconds
  lane: number; // 0=A, 1=S, 2=D, 3=F
  duration?: number; // >0 means hold note, duration in ms. undefined or 0 = tap note
}

export interface SongInfo {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  duration: number; // in seconds
  bpm: number;
  coverColor: string;
  beatmaps: Record<Difficulty, NoteData[]>;
}

// Generate beat patterns based on BPM - EASIER version
// Reduced note count, more breathing room, slower feel
function generateBeats(
  bpm: number,
  durationSec: number,
  difficulty: Difficulty
): NoteData[] {
  const beatInterval = 60000 / bpm; // ms per beat
  const halfBeat = beatInterval / 2;
  const quarterBeat = beatInterval / 4;
  const notes: NoteData[] = [];

  // Start after a 3-second lead-in
  const startTime = 3000;
  const endTime = durationSec * 1000 - 3000; // End 3s before clip ends

  // Define pattern templates for each difficulty
  type Pattern = Array<{ offset: number; lane: number }>;

  // Easy patterns: simple half notes and quarter notes, lots of rest
  const easyPatterns: Pattern[] = [
    // Pattern 0: Simple alternating (2 notes per measure)
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
    ],
    // Pattern 1: Left hand
    [
      { offset: 0, lane: 0 },
      { offset: beatInterval * 2, lane: 1 },
    ],
    // Pattern 2: Right hand
    [
      { offset: 0, lane: 2 },
      { offset: beatInterval * 2, lane: 3 },
    ],
    // Pattern 3: Walk across (slow)
    [
      { offset: 0, lane: 0 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 3 },
    ],
    // Pattern 4: Walk back
    [
      { offset: 0, lane: 3 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 0 },
    ],
    // Pattern 5: Single notes (very easy)
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
    ],
    // Pattern 6: Gentle bounce
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
    ],
  ];

  // Medium patterns: quarter notes with occasional eighth notes
  const mediumPatterns: Pattern[] = [
    // Pattern 0: Quarter note walk
    [
      { offset: 0, lane: 0 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 3 },
    ],
    // Pattern 1: Alternating pairs
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
    ],
    // Pattern 2: Left-right
    [
      { offset: 0, lane: 0 },
      { offset: beatInterval, lane: 3 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
    ],
    // Pattern 3: Eighth note pair
    [
      { offset: 0, lane: 1 },
      { offset: halfBeat, lane: 2 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 3, lane: 3 },
    ],
    // Pattern 4: Zigzag
    [
      { offset: 0, lane: 0 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 3 },
    ],
    // Pattern 5: Gentle rhythm
    [
      { offset: 0, lane: 1 },
      { offset: halfBeat, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 2 + halfBeat, lane: 0 },
    ],
    // Pattern 6: Breathing rhythm
    [
      { offset: 0, lane: 2 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval * 3, lane: 3 },
    ],
  ];

  // Hard patterns: eighth notes, some sixteenth note pairs, but still manageable
  const hardPatterns: Pattern[] = [
    // Pattern 0: Eighth note staircase
    [
      { offset: 0, lane: 0 },
      { offset: halfBeat, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: halfBeat + beatInterval, lane: 3 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: halfBeat + beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 0 },
      { offset: halfBeat + beatInterval * 3, lane: 1 },
    ],
    // Pattern 1: Quarter with eighth bursts
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: halfBeat + beatInterval, lane: 3 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: halfBeat + beatInterval * 3, lane: 2 },
    ],
    // Pattern 2: Double taps
    [
      { offset: 0, lane: 0 },
      { offset: 0, lane: 3 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 0 },
      { offset: halfBeat + beatInterval * 3, lane: 3 },
    ],
    // Pattern 3: Syncopated
    [
      { offset: 0, lane: 2 },
      { offset: halfBeat, lane: 1 },
      { offset: beatInterval, lane: 0 },
      { offset: beatInterval * 2, lane: 3 },
      { offset: halfBeat + beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 1 },
    ],
    // Pattern 4: Mixed rhythm
    [
      { offset: 0, lane: 1 },
      { offset: quarterBeat, lane: 2 },
      { offset: halfBeat, lane: 3 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: halfBeat + beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
      { offset: halfBeat + beatInterval * 3, lane: 3 },
    ],
    // Pattern 5: Breathing hard
    [
      { offset: 0, lane: 0 },
      { offset: halfBeat, lane: 1 },
      { offset: beatInterval * 2, lane: 3 },
      { offset: halfBeat + beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 1 },
    ],
    // Pattern 6: Quick burst then rest
    [
      { offset: 0, lane: 1 },
      { offset: quarterBeat, lane: 2 },
      { offset: halfBeat, lane: 1 },
      { offset: beatInterval * 2, lane: 3 },
      { offset: beatInterval * 3, lane: 0 },
    ],
  ];

  const patterns =
    difficulty === 'easy'
      ? easyPatterns
      : difficulty === 'medium'
        ? mediumPatterns
        : hardPatterns;

  const measureLength = beatInterval * 4; // 4 beats per measure

  let currentTime = startTime;
  let patternIndex = 0;

  while (currentTime < endTime) {
    const pattern = patterns[patternIndex % patterns.length];

    for (const note of pattern) {
      const noteTime = currentTime + note.offset;
      if (noteTime >= startTime && noteTime <= endTime) {
        notes.push({ time: noteTime, lane: note.lane });
      }
    }

    currentTime += measureLength;
    patternIndex++;

    // Add breathing room - skip measures periodically
    if (difficulty === 'easy') {
      // Skip every 3rd measure on easy for more rest
      if (patternIndex % 3 === 2) {
        currentTime += measureLength;
      }
    } else if (difficulty === 'medium') {
      // Skip every 4th measure on medium
      if (patternIndex % 4 === 3) {
        currentTime += measureLength * 0.5;
      }
    } else {
      // Hard: skip every 5th measure
      if (patternIndex % 5 === 4) {
        currentTime += measureLength * 0.5;
      }
    }
  }

  // Sort notes by time
  notes.sort((a, b) => a.time - b.time);

  // Remove any duplicate notes (same time and lane)
  const seen = new Set<string>();
  const deduped = notes.filter((note) => {
    const key = `${Math.round(note.time)}-${note.lane}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Add hold notes by converting some tap notes
  return addHoldNotes(deduped, bpm, difficulty);
}

// Post-processing: convert some tap notes into hold notes based on beat
function addHoldNotes(notes: NoteData[], bpm: number, difficulty: Difficulty): NoteData[] {
  const beatInterval = 60000 / bpm;
  const result = notes.map(n => ({ ...n }));

  let nth: number;
  let durationBeats: number;
  if (difficulty === 'easy') {
    nth = 5;
    durationBeats = 1;
  } else if (difficulty === 'medium') {
    nth = 4;
    durationBeats = 1.5;
  } else {
    nth = 3;
    durationBeats = 2;
  }

  const holdDuration = beatInterval * durationBeats;
  const minGap = beatInterval * 2;

  // Build sorted list of note times per lane for proximity checking
  const laneNoteTimes: Map<number, number[]> = new Map();
  for (const note of result) {
    if (!laneNoteTimes.has(note.lane)) laneNoteTimes.set(note.lane, []);
    laneNoteTimes.get(note.lane)!.push(note.time);
  }
  for (const times of laneNoteTimes.values()) {
    times.sort((a, b) => a - b);
  }

  // Track last hold end time per lane to prevent overlaps
  const lastHoldEndByLane: Map<number, number> = new Map();

  for (let i = 0; i < result.length; i++) {
    if ((i + 1) % nth !== 0) continue;

    const note = result[i];
    const holdEndTime = note.time + holdDuration;

    // Check: previous note in same lane must be at least minGap away
    const sameLaneTimes = laneNoteTimes.get(note.lane) ?? [];
    const noteIdxInLane = sameLaneTimes.indexOf(note.time);
    if (noteIdxInLane > 0) {
      const prevTime = sameLaneTimes[noteIdxInLane - 1];
      if (note.time - prevTime < minGap) continue;
    }

    // Check: next note in same lane must be at least minGap away from hold end
    if (noteIdxInLane >= 0 && noteIdxInLane < sameLaneTimes.length - 1) {
      const nextTime = sameLaneTimes[noteIdxInLane + 1];
      if (nextTime < holdEndTime + minGap) continue;
    }

    // Check: no overlap with previous hold note in same lane
    const lastHoldEnd = lastHoldEndByLane.get(note.lane) ?? -Infinity;
    if (note.time < lastHoldEnd) continue;

    // Convert to hold note
    result[i] = { ...note, duration: holdDuration };
    lastHoldEndByLane.set(note.lane, holdEndTime);
  }

  return result;
}

// Song definitions - 5 songs, full versions
export const songs: SongInfo[] = [
  {
    id: 'song1',
    title: '东京不太热',
    artist: '封茗囧菌',
    audioSrc: '/audio/song1.ogg',
    duration: 225,
    bpm: 130,
    coverColor: '#FF6B9D',
    beatmaps: {
      easy: generateBeats(130, 225, 'easy'),
      medium: generateBeats(130, 225, 'medium'),
      hard: generateBeats(130, 225, 'hard'),
    },
  },
  {
    id: 'song2',
    title: '小宇',
    artist: 'ZLY',
    audioSrc: '/audio/song2.ogg',
    duration: 267,
    bpm: 85,
    coverColor: '#4DD0E1',
    beatmaps: {
      easy: generateBeats(85, 267, 'easy'),
      medium: generateBeats(85, 267, 'medium'),
      hard: generateBeats(85, 267, 'hard'),
    },
  },
  {
    id: 'song3',
    title: '幹物女(喂喂）',
    artist: '养只正太嘛',
    audioSrc: '/audio/song3.ogg',
    duration: 254,
    bpm: 140,
    coverColor: '#FFB347',
    beatmaps: {
      easy: generateBeats(140, 254, 'easy'),
      medium: generateBeats(140, 254, 'medium'),
      hard: generateBeats(140, 254, 'hard'),
    },
  },
  {
    id: 'song4',
    title: 'Moshi Moshi',
    artist: 'Nozomi Kitay / Gal D / 百足',
    audioSrc: '/audio/song4.ogg',
    duration: 177,
    bpm: 128,
    coverColor: '#AED581',
    beatmaps: {
      easy: generateBeats(128, 177, 'easy'),
      medium: generateBeats(128, 177, 'medium'),
      hard: generateBeats(128, 177, 'hard'),
    },
  },
  {
    id: 'song5',
    title: '言って。（说吧。）',
    artist: 'ヨルシカ',
    audioSrc: '/audio/song5.ogg',
    duration: 242,
    bpm: 145,
    coverColor: '#E040FB',
    beatmaps: {
      easy: generateBeats(145, 242, 'easy'),
      medium: generateBeats(145, 242, 'medium'),
      hard: generateBeats(145, 242, 'hard'),
    },
  },
  {
    id: 'song6',
    title: '空の箱',
    artist: 'トゲナシトゲアリ',
    audioSrc: '/audio/song6.ogg',
    duration: 81,
    bpm: 175,
    coverColor: '#7C4DFF',
    beatmaps: {
      easy: generateBeats(175, 81, 'easy'),
      medium: generateBeats(175, 81, 'medium'),
      hard: generateBeats(175, 81, 'hard'),
    },
  },
];
