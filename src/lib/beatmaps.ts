// Beat map definitions for the rhythm game
// Each note: { time: ms, lane: 0-3 (A,S,D,F) }

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface NoteData {
  time: number; // in milliseconds
  lane: number; // 0=A, 1=S, 2=D, 3=F
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

// Generate beat patterns based on BPM
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
  const endTime = durationSec * 1000 - 2000; // End 2s before clip ends

  // Define pattern templates for each difficulty
  // Patterns are defined as offsets from measure start and lane assignments
  type Pattern = Array<{ offset: number; lane: number }>;

  // Easy patterns: simple quarter notes, mostly single lane per beat
  const easyPatterns: Pattern[] = [
    // Pattern 0: Basic quarter notes alternating
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
    ],
    // Pattern 1: Left hand focus
    [
      { offset: 0, lane: 0 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 3, lane: 1 },
    ],
    // Pattern 2: Right hand focus
    [
      { offset: 0, lane: 2 },
      { offset: beatInterval, lane: 3 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 3 },
    ],
    // Pattern 3: Walk across
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
    // Pattern 5: Half notes (simpler)
    [
      { offset: 0, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
    ],
  ];

  // Medium patterns: eighth notes, more variation
  const mediumPatterns: Pattern[] = [
    // Pattern 0: Eighth note runs
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
    // Pattern 1: Syncopated
    [
      { offset: 0, lane: 1 },
      { offset: halfBeat, lane: 2 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval + halfBeat * 1.5, lane: 3 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 2 + halfBeat, lane: 2 },
      { offset: beatInterval * 3, lane: 3 },
      { offset: beatInterval * 3 + halfBeat, lane: 1 },
    ],
    // Pattern 2: Alternating doubles
    [
      { offset: 0, lane: 0 },
      { offset: 0, lane: 3 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 2, lane: 3 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
    ],
    // Pattern 3: Staircase eighth notes
    [
      { offset: 0, lane: 0 },
      { offset: halfBeat, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: halfBeat + beatInterval, lane: 3 },
      { offset: beatInterval * 2, lane: 3 },
      { offset: halfBeat + beatInterval * 2, lane: 2 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: halfBeat + beatInterval * 3, lane: 0 },
    ],
    // Pattern 4: Quarter notes with off-beat
    [
      { offset: 0, lane: 1 },
      { offset: halfBeat, lane: 2 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 2 + halfBeat, lane: 3 },
    ],
    // Pattern 5: Mixed rhythm
    [
      { offset: 0, lane: 2 },
      { offset: beatInterval, lane: 0 },
      { offset: beatInterval + halfBeat, lane: 1 },
      { offset: beatInterval * 2, lane: 3 },
      { offset: beatInterval * 3, lane: 2 },
      { offset: beatInterval * 3 + halfBeat, lane: 0 },
    ],
  ];

  // Hard patterns: sixteenth notes, complex combinations
  const hardPatterns: Pattern[] = [
    // Pattern 0: Sixteenth note stream
    [
      { offset: 0, lane: 0 },
      { offset: quarterBeat, lane: 1 },
      { offset: quarterBeat * 2, lane: 2 },
      { offset: quarterBeat * 3, lane: 3 },
      { offset: beatInterval, lane: 3 },
      { offset: beatInterval + quarterBeat, lane: 2 },
      { offset: beatInterval + quarterBeat * 2, lane: 1 },
      { offset: beatInterval + quarterBeat * 3, lane: 0 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 2 + quarterBeat, lane: 2 },
      { offset: beatInterval * 2 + quarterBeat * 2, lane: 1 },
      { offset: beatInterval * 2 + quarterBeat * 3, lane: 3 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: beatInterval * 3 + quarterBeat, lane: 0 },
      { offset: beatInterval * 3 + quarterBeat * 2, lane: 3 },
      { offset: beatInterval * 3 + quarterBeat * 3, lane: 2 },
    ],
    // Pattern 1: Double note patterns
    [
      { offset: 0, lane: 0 },
      { offset: 0, lane: 3 },
      { offset: halfBeat, lane: 1 },
      { offset: halfBeat, lane: 2 },
      { offset: beatInterval, lane: 0 },
      { offset: beatInterval, lane: 2 },
      { offset: halfBeat + beatInterval, lane: 1 },
      { offset: halfBeat + beatInterval, lane: 3 },
      { offset: beatInterval * 2, lane: 0 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: halfBeat + beatInterval * 2, lane: 2 },
      { offset: halfBeat + beatInterval * 2, lane: 3 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
      { offset: halfBeat + beatInterval * 3, lane: 0 },
      { offset: halfBeat + beatInterval * 3, lane: 3 },
    ],
    // Pattern 2: Fast alternating
    [
      { offset: 0, lane: 1 },
      { offset: quarterBeat, lane: 2 },
      { offset: halfBeat, lane: 1 },
      { offset: quarterBeat * 3, lane: 2 },
      { offset: beatInterval, lane: 0 },
      { offset: beatInterval + quarterBeat, lane: 3 },
      { offset: beatInterval + halfBeat, lane: 0 },
      { offset: beatInterval + quarterBeat * 3, lane: 3 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 2 + quarterBeat, lane: 2 },
      { offset: beatInterval * 2 + halfBeat, lane: 1 },
      { offset: beatInterval * 2 + quarterBeat * 3, lane: 2 },
      { offset: beatInterval * 3, lane: 0 },
      { offset: beatInterval * 3 + quarterBeat, lane: 3 },
      { offset: beatInterval * 3 + halfBeat, lane: 0 },
      { offset: beatInterval * 3 + quarterBeat * 3, lane: 3 },
    ],
    // Pattern 3: Mixed complexity
    [
      { offset: 0, lane: 2 },
      { offset: halfBeat, lane: 0 },
      { offset: halfBeat, lane: 3 },
      { offset: beatInterval, lane: 1 },
      { offset: beatInterval + quarterBeat, lane: 2 },
      { offset: beatInterval + halfBeat, lane: 0 },
      { offset: beatInterval + quarterBeat * 3, lane: 3 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: beatInterval * 2 + halfBeat, lane: 0 },
      { offset: beatInterval * 2 + halfBeat, lane: 3 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: beatInterval * 3 + quarterBeat, lane: 2 },
      { offset: beatInterval * 3 + quarterBeat * 2, lane: 1 },
      { offset: beatInterval * 3 + quarterBeat * 3, lane: 0 },
    ],
    // Pattern 4: Jump patterns
    [
      { offset: 0, lane: 0 },
      { offset: 0, lane: 1 },
      { offset: beatInterval, lane: 2 },
      { offset: beatInterval, lane: 3 },
      { offset: beatInterval + halfBeat, lane: 0 },
      { offset: beatInterval + halfBeat, lane: 3 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 2, lane: 2 },
      { offset: beatInterval * 2 + halfBeat, lane: 0 },
      { offset: beatInterval * 2 + halfBeat, lane: 1 },
      { offset: beatInterval * 3, lane: 2 },
      { offset: beatInterval * 3, lane: 3 },
      { offset: beatInterval * 3 + halfBeat, lane: 1 },
      { offset: beatInterval * 3 + halfBeat, lane: 2 },
    ],
    // Pattern 5: Grace notes
    [
      { offset: 0, lane: 1 },
      { offset: quarterBeat, lane: 2 },
      { offset: halfBeat, lane: 3 },
      { offset: beatInterval, lane: 0 },
      { offset: beatInterval + halfBeat, lane: 2 },
      { offset: beatInterval * 2, lane: 1 },
      { offset: beatInterval * 2 + quarterBeat, lane: 3 },
      { offset: beatInterval * 2 + halfBeat, lane: 0 },
      { offset: beatInterval * 2 + quarterBeat * 3, lane: 2 },
      { offset: beatInterval * 3, lane: 1 },
      { offset: beatInterval * 3 + quarterBeat, lane: 0 },
      { offset: beatInterval * 3 + halfBeat, lane: 3 },
      { offset: beatInterval * 3 + quarterBeat * 3, lane: 1 },
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

    // Add some variation - occasionally skip a measure for breathing room
    if (difficulty === 'easy' && patternIndex % 4 === 3) {
      // Skip every 4th measure on easy
      currentTime += measureLength;
    } else if (difficulty === 'medium' && patternIndex % 6 === 5) {
      // Skip every 6th measure on medium
      currentTime += measureLength * 0.5;
    }
  }

  // Sort notes by time
  notes.sort((a, b) => a.time - b.time);

  // Remove any duplicate notes (same time and lane)
  const seen = new Set<string>();
  return notes.filter((note) => {
    const key = `${note.time}-${note.lane}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Song definitions
export const songs: SongInfo[] = [
  {
    id: 'song1',
    title: '东京不太热',
    artist: '封茗囧菌',
    audioSrc: '/audio/song1.ogg',
    duration: 62,
    bpm: 130,
    coverColor: '#FF6B9D',
    beatmaps: {
      easy: generateBeats(130, 62, 'easy'),
      medium: generateBeats(130, 62, 'medium'),
      hard: generateBeats(130, 62, 'hard'),
    },
  },
  {
    id: 'song2',
    title: '绊',
    artist: 'NanNan--',
    audioSrc: '/audio/song2.ogg',
    duration: 62,
    bpm: 120,
    coverColor: '#7C4DFF',
    beatmaps: {
      easy: generateBeats(120, 62, 'easy'),
      medium: generateBeats(120, 62, 'medium'),
      hard: generateBeats(120, 62, 'hard'),
    },
  },
];
