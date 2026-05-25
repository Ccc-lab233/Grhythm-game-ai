'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { songs, type Difficulty, type SongInfo, type NoteData } from '@/lib/beatmaps';

// ============ TYPES ============
type GameScreen = 'start' | 'playing' | 'result';

interface GameState {
  screen: GameScreen;
  selectedSong: SongInfo | null;
  selectedDifficulty: Difficulty;
  score: number;
  combo: number;
  maxCombo: number;
  missCount: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  totalNotes: number;
  isPaused: boolean;
}

interface ActiveNote extends NoteData {
  id: number;
  hit: boolean;
  missed: boolean;
  colorIdx: number;
}

interface HitEffect {
  id: number;
  lane: number;
  type: 'perfect' | 'great' | 'good' | 'miss';
  time: number;
}

// ============ CONSTANTS ============
// Vibrant, varied note color palettes (cycling through for visual variety)
const NOTE_PALETTES = [
  { main: '#FF6B9D', light: '#FFB3CC', glow: '#FF6B9D' },  // Rose
  { main: '#FF8A65', light: '#FFCCBC', glow: '#FF8A65' },  // Coral
  { main: '#FFB347', light: '#FFE0B2', glow: '#FFB347' },  // Amber
  { main: '#FFD54F', light: '#FFF9C4', glow: '#FFD54F' },  // Gold
  { main: '#AED581', light: '#DCEDC8', glow: '#AED581' },  // Lime
  { main: '#4DD0E1', light: '#B2EBF2', glow: '#4DD0E1' },  // Cyan
  { main: '#7C4DFF', light: '#D1C4E9', glow: '#7C4DFF' },  // Deep Purple
  { main: '#E040FB', light: '#F3E5F5', glow: '#E040FB' },  // Magenta
  { main: '#FF5252', light: '#FFCDD2', glow: '#FF5252' },  // Red
  { main: '#69F0AE', light: '#B9F6CA', glow: '#69F0AE' },  // Mint
];

const LANE_BASE_COLORS = ['#FF6B9D', '#FFB347', '#7ED321', '#BD10E0'];
const LANE_KEYS = ['A', 'S', 'D', 'F'];
const KEY_CODES = ['KeyA', 'KeyS', 'KeyD', 'KeyF'];

const TIMING_WINDOWS = {
  perfect: 70,
  great: 140,
  good: 200,
};

const SCORE_VALUES = {
  perfect: 300,
  great: 200,
  good: 100,
  miss: 0,
};

const NOTE_TRAVEL_TIME = 2500; // ms for a note to travel from top to hit zone (slowed down)
const LANE_WIDTH = 88;
const NOTE_HEIGHT = 22;
const NOTE_GAP = 5;

// ============ HELPER FUNCTIONS ============
function getGrade(score: number, totalNotes: number): string {
  if (totalNotes === 0) return 'F';
  const ratio = score / (totalNotes * SCORE_VALUES.perfect);
  if (ratio >= 0.95) return 'S';
  if (ratio >= 0.85) return 'A';
  if (ratio >= 0.70) return 'B';
  if (ratio >= 0.50) return 'C';
  return 'F';
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'S': return '#FFD700';
    case 'A': return '#FF6B9D';
    case 'B': return '#7ED321';
    case 'C': return '#FFB347';
    default: return '#999';
  }
}

// ============ START SCREEN ============
function StartScreen({
  onSelectSong,
  selectedSong,
  onSelectDifficulty,
  selectedDifficulty,
  onStart,
}: {
  onSelectSong: (song: SongInfo) => void;
  selectedSong: SongInfo | null;
  onSelectDifficulty: (d: Difficulty) => void;
  selectedDifficulty: Difficulty;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 px-4 py-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h1
          className="text-5xl sm:text-6xl font-black tracking-tight mb-2"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D, #FFB347, #4DD0E1, #7C4DFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ♪ GBC节拍律动
        </h1>
        <p className="text-gray-400 text-sm tracking-[0.3em] mt-2">RHYTHM GAME</p>
        {/* Cover image below title */}
        <div className="mt-4 mb-2">
          <img
            src="/cover-image.png"
            alt="cover"
            className="w-32 h-28 sm:w-40 sm:h-32 object-cover rounded-2xl shadow-lg mx-auto"
            style={{ border: '2px solid rgba(255,107,157,0.2)' }}
          />
        </div>
      </div>

      {/* Song Selection */}
      <div className="w-full max-w-md mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">选择曲目</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ddd transparent' }}>
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => onSelectSong(song)}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left
                ${selectedSong?.id === song.id
                  ? 'border-transparent shadow-lg scale-[1.02]'
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-md bg-white/80 backdrop-blur'
                }`}
              style={selectedSong?.id === song.id ? {
                background: `linear-gradient(135deg, ${song.coverColor}12, ${song.coverColor}06)`,
                borderColor: song.coverColor + '50',
              } : {}}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${song.coverColor}, ${song.coverColor}BB)` }}
                >
                  ♪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-base truncate">{song.title}</p>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-300">BPM</p>
                  <p className="font-mono font-bold text-gray-500">{song.bpm}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="w-full max-w-md mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">选择难度</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'easy' as Difficulty, label: '简单', color: '#7ED321', emoji: '🌱', desc: '节奏舒缓' },
            { key: 'medium' as Difficulty, label: '中等', color: '#FFB347', emoji: '🔥', desc: '逐步加快' },
            { key: 'hard' as Difficulty, label: '困难', color: '#FF6B9D', emoji: '💀', desc: '极速挑战' },
          ]).map((d) => (
            <button
              key={d.key}
              onClick={() => onSelectDifficulty(d.key)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border-2 flex flex-col items-center
                ${selectedDifficulty === d.key
                  ? 'text-white shadow-lg scale-105 border-transparent'
                  : 'bg-white/80 text-gray-500 border-gray-100 hover:border-gray-200 hover:shadow'
                }`}
              style={selectedDifficulty === d.key ? {
                background: `linear-gradient(135deg, ${d.color}, ${d.color}CC)`,
              } : {}}
            >
              <span className="text-xl mb-0.5">{d.emoji}</span>
              {d.label}
              <span className="text-[10px] font-normal mt-0.5 opacity-70">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!selectedSong}
        className={`px-14 py-4 rounded-2xl font-bold text-lg transition-all duration-200
          ${selectedSong
            ? 'text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        style={selectedSong ? {
          background: `linear-gradient(135deg, ${selectedSong.coverColor}, ${selectedSong.coverColor}BB)`,
        } : {}}
      >
        开始游戏 🎵
      </button>

      {/* Controls hint */}
      <div className="mt-8 text-center text-gray-300 text-xs space-y-1">
        <p>使用 <span className="inline-flex gap-1">
          {['A', 'S', 'D', 'F'].map(k => (
            <span key={k} className="font-mono font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[11px]">{k}</span>
          ))}
        </span> 键击打音符</p>
        <p>尽情享受音乐吧</p>
      </div>
    </div>
  );
}

// ============ GAME PLAY ============
function GamePlay({
  song,
  difficulty,
  onEnd,
}: {
  song: SongInfo;
  difficulty: Difficulty;
  onEnd: (state: Omit<GameState, 'screen' | 'selectedSong' | 'selectedDifficulty' | 'isPaused'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hitBufferRef = useRef<{ perfect: AudioBuffer | null; great: AudioBuffer | null; good: AudioBuffer | null }>({
    perfect: null,
    great: null,
    good: null,
  });
  const gameStateRef = useRef({
    startTime: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    missCount: 0,
    perfectCount: 0,
    greatCount: 0,
    goodCount: 0,
    totalNotes: 0,
    gameEnded: false,
  });
  const notesRef = useRef<ActiveNote[]>([]);
  const hitEffectsRef = useRef<HitEffect[]>([]);
  const keysDownRef = useRef<Set<number>>(new Set());
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeLanes, setActiveLanes] = useState<Set<number>>(new Set());
  const [displayState, setDisplayState] = useState({
    score: 0,
    combo: 0,
    missCount: 0,
  });
  const [countdown, setCountdown] = useState(3);
  const [playing, setPlaying] = useState(false);
  const gameStartedRef = useRef(false);

  const beatmap = song.beatmaps[difficulty];

  // Initialize notes with color assignments
  useEffect(() => {
    const activeNotes: ActiveNote[] = beatmap.map((note, i) => ({
      ...note,
      id: i,
      hit: false,
      missed: false,
      colorIdx: (i * 3 + note.lane * 7) % NOTE_PALETTES.length,
    }));
    notesRef.current = activeNotes;
    gameStateRef.current.totalNotes = activeNotes.length;
  }, [beatmap]);

  // Initialize Web Audio API and load hit sounds
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const loadSound = async (url: string): Promise<AudioBuffer> => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return ctx.decodeAudioData(arrayBuffer);
    };

    Promise.all([
      loadSound('/audio/hit.wav'),
      loadSound('/audio/hit_great.wav'),
      loadSound('/audio/hit_good.wav'),
    ]).then(([perfectBuf, greatBuf, goodBuf]) => {
      hitBufferRef.current = { perfect: perfectBuf, great: greatBuf, good: goodBuf };
    }).catch(console.error);

    return () => {
      ctx.close();
    };
  }, []);

  // Play hit sound helper
  const playHitSound = useCallback((type: 'perfect' | 'great' | 'good') => {
    const ctx = audioCtxRef.current;
    const buffer = hitBufferRef.current[type];
    if (!ctx || !buffer) return;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = type === 'perfect' ? 0.35 : type === 'great' ? 0.25 : 0.18;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } catch {
      // Ignore audio errors
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Countdown and start
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      timer = setTimeout(() => {
        gameStartedRef.current = true;
        setPlaying(true);
        const audio = new Audio(song.audioSrc);
        audio.volume = 0.7;
        audioRef.current = audio;
        audio.play().catch(console.error);
        gameStateRef.current.startTime = performance.now();
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [countdown, song.audioSrc]);

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const laneIndex = KEY_CODES.indexOf(e.code);
      if (laneIndex === -1) return;
      e.preventDefault();
      if (keysDownRef.current.has(laneIndex)) return;
      keysDownRef.current.add(laneIndex);

      if (!gameStartedRef.current) return;

      const currentTime = performance.now() - gameStateRef.current.startTime;
      let closestNoteIdx = -1;
      let closestDiff = Infinity;

      const notes = notesRef.current;
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.hit || note.missed || note.lane !== laneIndex) continue;
        const diff = Math.abs(note.time - currentTime);
        if (diff < closestDiff && diff <= TIMING_WINDOWS.good) {
          closestDiff = diff;
          closestNoteIdx = i;
        }
      }

      if (closestNoteIdx >= 0) {
        const updatedNotes = [...notes];
        updatedNotes[closestNoteIdx] = { ...updatedNotes[closestNoteIdx], hit: true };
        notesRef.current = updatedNotes;

        let hitType: 'perfect' | 'great' | 'good';
        if (closestDiff <= TIMING_WINDOWS.perfect) {
          hitType = 'perfect';
          gameStateRef.current.perfectCount++;
        } else if (closestDiff <= TIMING_WINDOWS.great) {
          hitType = 'great';
          gameStateRef.current.greatCount++;
        } else {
          hitType = 'good';
          gameStateRef.current.goodCount++;
        }

        gameStateRef.current.combo++;
        if (gameStateRef.current.combo > gameStateRef.current.maxCombo) {
          gameStateRef.current.maxCombo = gameStateRef.current.combo;
        }

        const comboMultiplier = Math.min(1 + Math.floor(gameStateRef.current.combo / 10) * 0.1, 2);
        gameStateRef.current.score += Math.round(SCORE_VALUES[hitType] * comboMultiplier);

        playHitSound(hitType);

        hitEffectsRef.current.push({
          id: Date.now() + Math.random(),
          lane: laneIndex,
          type: hitType,
          time: performance.now(),
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const laneIndex = KEY_CODES.indexOf(e.code);
      if (laneIndex === -1) return;
      keysDownRef.current.delete(laneIndex);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playHitSound]);

  const triggerGameEnd = useCallback(() => {
    if (gameStateRef.current.gameEnded) return;
    gameStateRef.current.gameEnded = true;
    if (audioRef.current) audioRef.current.pause();
    setTimeout(() => {
      onEnd({
        score: gameStateRef.current.score,
        combo: gameStateRef.current.maxCombo,
        maxCombo: gameStateRef.current.maxCombo,
        missCount: gameStateRef.current.missCount,
        perfectCount: gameStateRef.current.perfectCount,
        greatCount: gameStateRef.current.greatCount,
        goodCount: gameStateRef.current.goodCount,
        totalNotes: gameStateRef.current.totalNotes,
      });
    }, 1500);
  }, [onEnd]);

  // Game render loop
  useEffect(() => {
    if (!playing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let frameCount = 0;

    const render = () => {
      if (gameStateRef.current.gameEnded) return;

      const currentTime = performance.now() - gameStateRef.current.startTime;
      const w = dimensions.width;
      const h = dimensions.height;
      frameCount++;

      // Set canvas size with DPR
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      const isMobile = w < 768;
      const laneW = isMobile ? Math.floor(w / 4) : LANE_WIDTH;
      const totalLW = laneW * 4;
      const laneOffset = (w - totalLW) / 2;
      const hitZoneY = isMobile ? h - 150 : h - 110;

      // Clear with gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#FEFEFE');
      bgGrad.addColorStop(0.5, '#FBFAFF');
      bgGrad.addColorStop(1, '#F5F3FA');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw lane backgrounds with subtle gradient
      for (let i = 0; i < 4; i++) {
        const x = laneOffset + i * laneW;
        const isKeyDown = keysDownRef.current.has(i);

        const laneGrad = ctx.createLinearGradient(0, 0, 0, h);
        if (isKeyDown) {
          laneGrad.addColorStop(0, LANE_BASE_COLORS[i] + '08');
          laneGrad.addColorStop(0.8, LANE_BASE_COLORS[i] + '20');
          laneGrad.addColorStop(1, LANE_BASE_COLORS[i] + '30');
        } else {
          laneGrad.addColorStop(0, '#00000003');
          laneGrad.addColorStop(0.8, '#00000005');
          laneGrad.addColorStop(1, '#00000008');
        }
        ctx.fillStyle = laneGrad;
        ctx.fillRect(x, 0, laneW, h);

        // Lane divider (subtle)
        if (i > 0) {
          ctx.strokeStyle = '#00000008';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 8]);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Lane borders
      ctx.strokeStyle = '#0000000A';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(laneOffset, 0, totalLW, h);

      // Draw hit zone - a glowing bar
      const hitBarY = hitZoneY + NOTE_HEIGHT / 2;
      for (let i = 0; i < 4; i++) {
        const x = laneOffset + i * laneW;
        const isKeyDown = keysDownRef.current.has(i);

        // Hit zone glow
        if (isKeyDown) {
          const glowGrad = ctx.createRadialGradient(
            x + laneW / 2, hitBarY, 5,
            x + laneW / 2, hitBarY, 50
          );
          glowGrad.addColorStop(0, LANE_BASE_COLORS[i] + '30');
          glowGrad.addColorStop(1, LANE_BASE_COLORS[i] + '00');
          ctx.fillStyle = glowGrad;
          ctx.fillRect(x - 10, hitBarY - 50, laneW + 20, 100);
        }
      }

      // Hit zone line (main)
      const hitLineGrad = ctx.createLinearGradient(laneOffset, 0, laneOffset + totalLW, 0);
      hitLineGrad.addColorStop(0, '#FF6B9D40');
      hitLineGrad.addColorStop(0.25, '#FFB34740');
      hitLineGrad.addColorStop(0.5, '#7ED32140');
      hitLineGrad.addColorStop(0.75, '#BD10E040');
      hitLineGrad.addColorStop(1, '#FF6B9D40');
      ctx.strokeStyle = hitLineGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laneOffset, hitZoneY + NOTE_HEIGHT + 2);
      ctx.lineTo(laneOffset + totalLW, hitZoneY + NOTE_HEIGHT + 2);
      ctx.stroke();

      // Mobile: draw touch zone indicator below hit zone
      if (isMobile) {
        const touchZoneGrad = ctx.createLinearGradient(0, hitZoneY + NOTE_HEIGHT + 10, 0, h);
        touchZoneGrad.addColorStop(0, 'rgba(0,0,0,0)');
        touchZoneGrad.addColorStop(0.3, 'rgba(0,0,0,0.02)');
        touchZoneGrad.addColorStop(1, 'rgba(0,0,0,0.04)');
        ctx.fillStyle = touchZoneGrad;
        ctx.fillRect(laneOffset, hitZoneY + NOTE_HEIGHT + 10, totalLW, h - hitZoneY - NOTE_HEIGHT - 10);

        // Draw lane-colored touch indicators
        for (let i = 0; i < 4; i++) {
          const x = laneOffset + i * laneW;
          const isKeyDown = keysDownRef.current.has(i);
          const indicatorY = hitZoneY + NOTE_HEIGHT + 20;
          const indicatorH = 8;
          ctx.fillStyle = isKeyDown ? LANE_BASE_COLORS[i] + '60' : LANE_BASE_COLORS[i] + '25';
          ctx.beginPath();
          ctx.roundRect(x + 8, indicatorY, laneW - 16, indicatorH, 4);
          ctx.fill();
        }
      }

      // Draw key labels at hit zone (desktop only - mobile uses touch buttons)
      if (!isMobile) {
      for (let i = 0; i < 4; i++) {
        const x = laneOffset + i * laneW;
        const isKeyDown = keysDownRef.current.has(i);
        const cx = x + laneW / 2;

        // Key button
        const btnY = hitZoneY + 28;
        const btnH = 40;
        const btnW = laneW - 20;
        const btnX = x + 10;

        // Button shadow
        if (isKeyDown) {
          ctx.fillStyle = LANE_BASE_COLORS[i] + '15';
          ctx.beginPath();
          ctx.roundRect(btnX, btnY + 2, btnW, btnH, 10);
          ctx.fill();
        }

        // Button background
        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
        if (isKeyDown) {
          btnGrad.addColorStop(0, LANE_BASE_COLORS[i] + '30');
          btnGrad.addColorStop(1, LANE_BASE_COLORS[i] + '50');
        } else {
          btnGrad.addColorStop(0, '#FFFFFF');
          btnGrad.addColorStop(1, '#F9FAFB');
        }
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 10);
        ctx.fill();

        // Button border
        ctx.strokeStyle = isKeyDown ? LANE_BASE_COLORS[i] + '80' : '#E5E7EB';
        ctx.lineWidth = isKeyDown ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 10);
        ctx.stroke();

        // Key letter
        ctx.fillStyle = isKeyDown ? LANE_BASE_COLORS[i] : '#9CA3AF';
        ctx.font = `bold 20px "Geist Mono", "SF Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(LANE_KEYS[i], cx, btnY + btnH / 2);
      }
      }

      // Draw notes
      let allNotesProcessed = true;

      const notes = notesRef.current;
      for (let ni = 0; ni < notes.length; ni++) {
        const note = notes[ni];
        if (note.hit || note.missed) continue;

        const timeDiff = note.time - currentTime;
        const noteY = hitZoneY - (timeDiff / NOTE_TRAVEL_TIME) * hitZoneY;

        if (noteY < -NOTE_HEIGHT * 3) {
          allNotesProcessed = false;
          continue;
        }

        // Note is below the hit zone - check for miss
        if (timeDiff < -TIMING_WINDOWS.good) {
          const updatedNotes = [...notes];
          updatedNotes[ni] = { ...note, missed: true };
          notesRef.current = updatedNotes;
          gameStateRef.current.missCount++;
          gameStateRef.current.combo = 0;

          hitEffectsRef.current.push({
            id: Date.now() + Math.random(),
            lane: note.lane,
            type: 'miss',
            time: performance.now(),
          });

          continue;
        }

        allNotesProcessed = false;

        const x = laneOffset + note.lane * laneW;
        const noteX = x + NOTE_GAP;
        const noteW = laneW - NOTE_GAP * 2;
        const palette = NOTE_PALETTES[note.colorIdx];

        // Note glow effect (when close to hit zone)
        const proximity = Math.max(0, 1 - Math.abs(timeDiff) / NOTE_TRAVEL_TIME);
        if (proximity > 0.5) {
          const glowAlpha = (proximity - 0.5) * 2 * 0.15;
          ctx.fillStyle = palette.glow + Math.round(glowAlpha * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.roundRect(noteX - 3, noteY - 3, noteW + 6, NOTE_HEIGHT + 6, 9);
          ctx.fill();
        }

        // Note shadow
        ctx.fillStyle = palette.main + '18';
        ctx.beginPath();
        ctx.roundRect(noteX + 2, noteY + 2, noteW, NOTE_HEIGHT, 7);
        ctx.fill();

        // Note body with gradient
        const noteGrad = ctx.createLinearGradient(noteX, noteY, noteX + noteW, noteY + NOTE_HEIGHT);
        noteGrad.addColorStop(0, palette.main);
        noteGrad.addColorStop(0.6, palette.main + 'DD');
        noteGrad.addColorStop(1, palette.light);
        ctx.fillStyle = noteGrad;
        ctx.beginPath();
        ctx.roundRect(noteX, noteY, noteW, NOTE_HEIGHT, 7);
        ctx.fill();

        // Note shine
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.roundRect(noteX + 3, noteY + 1, noteW - 6, NOTE_HEIGHT * 0.4, [4, 4, 1, 1]);
        ctx.fill();

        // Note border
        ctx.strokeStyle = palette.main + '40';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(noteX, noteY, noteW, NOTE_HEIGHT, 7);
        ctx.stroke();
      }

      // Draw hit effects
      const now = performance.now();
      hitEffectsRef.current = hitEffectsRef.current.filter((effect) => {
        const age = now - effect.time;
        if (age > 700) return false;

        const x = laneOffset + effect.lane * laneW + laneW / 2;
        const y = hitZoneY;
        const alpha = Math.max(0, 1 - age / 700);

        if (effect.type === 'miss') {
          // Red X flash
          ctx.save();
          ctx.globalAlpha = alpha * 0.4;
          ctx.fillStyle = '#FF3B30';
          ctx.fillRect(laneOffset + effect.lane * laneW, hitZoneY - 15, laneW, NOTE_HEIGHT + 30);
          ctx.restore();

          ctx.fillStyle = `rgba(255, 59, 48, ${alpha})`;
          ctx.font = `bold 15px "Geist", "SF Pro", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('MISS', x, y - 28 - (age / 700) * 25);
        } else {
          const color = effect.type === 'perfect' ? '#FFD700'
            : effect.type === 'great' ? '#4DD0E1'
            : '#FFB347';

          // Expanding ring
          const ringRadius = 12 + (age / 700) * 35;
          ctx.strokeStyle = color + Math.round(alpha * 200).toString(16).padStart(2, '0');
          ctx.lineWidth = Math.max(0.5, 3 * (1 - age / 700));
          ctx.beginPath();
          ctx.arc(x, y + NOTE_HEIGHT / 2, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner glow
          if (age < 200) {
            const innerAlpha = (1 - age / 200) * 0.3;
            const innerGrad = ctx.createRadialGradient(x, y + NOTE_HEIGHT / 2, 0, x, y + NOTE_HEIGHT / 2, 30);
            innerGrad.addColorStop(0, color + Math.round(innerAlpha * 255).toString(16).padStart(2, '0'));
            innerGrad.addColorStop(1, color + '00');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(x, y + NOTE_HEIGHT / 2, 30, 0, Math.PI * 2);
            ctx.fill();
          }

          // Score label
          const label = effect.type === 'perfect' ? 'PERFECT'
            : effect.type === 'great' ? 'GREAT'
            : 'GOOD';
          ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.font = `bold 13px "Geist", "SF Pro", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(label, x, y - 26 - (age / 700) * 30);
        }

        return true;
      });

      // Song progress bar
      const songProgress = Math.min(currentTime / (song.duration * 1000), 1);
      ctx.fillStyle = '#00000006';
      ctx.fillRect(0, h - 3, w, 3);
      const progGrad = ctx.createLinearGradient(0, 0, w * songProgress, 0);
      progGrad.addColorStop(0, '#FF6B9D60');
      progGrad.addColorStop(1, '#7C4DFF60');
      ctx.fillStyle = progGrad;
      ctx.fillRect(0, h - 3, w * songProgress, 3);

      // Update display state every few frames
      if (frameCount % 3 === 0) {
        setDisplayState({
          score: gameStateRef.current.score,
          combo: gameStateRef.current.combo,
          missCount: gameStateRef.current.missCount,
        });
        setActiveLanes(new Set(keysDownRef.current));
      }

      if (allNotesProcessed && currentTime > 5000) {
        triggerGameEnd();
        return;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [playing, dimensions, triggerGameEnd, song.duration]);

  // Touch handlers
  const handleTouchStart = useCallback((laneIndex: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    keysDownRef.current.add(laneIndex);

    if (!gameStartedRef.current) return;

    const currentTime = performance.now() - gameStateRef.current.startTime;
    let closestNoteIdx = -1;
    let closestDiff = Infinity;

    const notes = notesRef.current;
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (note.hit || note.missed || note.lane !== laneIndex) continue;
      const diff = Math.abs(note.time - currentTime);
      if (diff < closestDiff && diff <= TIMING_WINDOWS.good) {
        closestDiff = diff;
        closestNoteIdx = i;
      }
    }

    if (closestNoteIdx >= 0) {
      const updatedNotes = [...notes];
      updatedNotes[closestNoteIdx] = { ...updatedNotes[closestNoteIdx], hit: true };
      notesRef.current = updatedNotes;

      let hitType: 'perfect' | 'great' | 'good';
      if (closestDiff <= TIMING_WINDOWS.perfect) {
        hitType = 'perfect';
        gameStateRef.current.perfectCount++;
      } else if (closestDiff <= TIMING_WINDOWS.great) {
        hitType = 'great';
        gameStateRef.current.greatCount++;
      } else {
        hitType = 'good';
        gameStateRef.current.goodCount++;
      }

      gameStateRef.current.combo++;
      if (gameStateRef.current.combo > gameStateRef.current.maxCombo) {
        gameStateRef.current.maxCombo = gameStateRef.current.combo;
      }

      const comboMultiplier = Math.min(1 + Math.floor(gameStateRef.current.combo / 10) * 0.1, 2);
      gameStateRef.current.score += Math.round(SCORE_VALUES[hitType] * comboMultiplier);

      playHitSound(hitType);

      hitEffectsRef.current.push({
        id: Date.now() + Math.random(),
        lane: laneIndex,
        type: hitType,
        time: performance.now(),
      });
    }
  }, [playHitSound]);

  const handleTouchEnd = useCallback((laneIndex: number) => () => {
    keysDownRef.current.delete(laneIndex);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-white overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Touch buttons for mobile - prominent colored buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex md:hidden z-10 gap-1 px-1 pb-[env(safe-area-inset-bottom,8px)] pt-1"
           style={{ height: '120px' }}>
        {[0, 1, 2, 3].map((i) => {
          const isActive = activeLanes.has(i);
          return (
            <button
              key={i}
              onTouchStart={handleTouchStart(i)}
              onTouchEnd={handleTouchEnd(i)}
              onTouchCancel={handleTouchEnd(i)}
              className="flex-1 flex flex-col items-center justify-center rounded-xl font-black text-white text-2xl transition-transform active:scale-95"
              style={{
                background: `linear-gradient(180deg, ${LANE_BASE_COLORS[i]}${isActive ? 'CC' : '80'}, ${LANE_BASE_COLORS[i]}${isActive ? '99' : '60'})`,
                border: `2px solid ${LANE_BASE_COLORS[i]}50`,
                textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                minHeight: '100px',
                transform: isActive ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              <span className="text-base font-bold opacity-60 mb-0.5">{LANE_KEYS[i]}</span>
              <span className="text-2xl">♪</span>
            </button>
          );
        })}
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 flex justify-between items-start pointer-events-none z-10">
        {/* Score */}
        <div className="text-left bg-white/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider">SCORE</p>
          <p className="text-xl font-black text-gray-800 font-mono">{displayState.score.toLocaleString()}</p>
        </div>

        {/* Combo */}
        {displayState.combo > 1 && (
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl px-4 py-1.5">
            <p
              className="text-3xl font-black leading-tight"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D, #FFB347, #4DD0E1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {displayState.combo}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider">COMBO</p>
          </div>
        )}

        {/* Miss counter */}
        <div className="text-right bg-white/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider">MISS</p>
          <p className="text-xl font-black text-red-400 font-mono">{displayState.missCount}</p>
        </div>
      </div>

      {/* Song info */}
      <div className="absolute bottom-6 left-4 pointer-events-none z-10 bg-white/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
        <p className="text-xs font-semibold text-gray-600">{song.title}</p>
        <p className="text-[10px] text-gray-400">{song.artist} · {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}</p>
      </div>

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 z-20">
          <div className="text-center">
            <p
              className="text-8xl font-black animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D, #7C4DFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {countdown}
            </p>
            <p className="text-lg text-gray-400 mt-3 font-medium">准备...</p>
          </div>
        </div>
      )}

    </div>
  );
}

// ============ RESULT SCREEN ============
function ResultScreen({
  state,
  song,
  difficulty,
  onRestart,
  onBack,
}: {
  state: Omit<GameState, 'screen' | 'selectedSong' | 'selectedDifficulty' | 'isPaused'>;
  song: SongInfo;
  difficulty: Difficulty;
  onRestart: () => void;
  onBack: () => void;
}) {
  const grade = getGrade(state.score, state.totalNotes);
  const gradeColor = getGradeColor(grade);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 px-4 py-8">
      {/* Grade */}
      <div className="mb-8">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-7xl font-black shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}AA)`,
            color: grade === 'S' ? '#333' : '#FFF',
            boxShadow: `0 0 60px ${gradeColor}30, 0 0 120px ${gradeColor}15`,
          }}
        >
          {grade}
        </div>
      </div>

      {/* Result card */}
      <div className="w-full max-w-sm bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6 mb-6 border border-white/50">
        <div className="text-center mb-5">
          <p className="text-lg font-bold text-gray-800">{song.title}</p>
          <p className="text-sm text-gray-400">
            {song.artist} · {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-black text-gray-800 font-mono">{state.score.toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-1">总分</p>
        </div>

        {/* Hit vs Miss summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-green-100/50">
            <p className="text-3xl font-black text-green-500">{state.perfectCount + state.greatCount + state.goodCount}</p>
            <p className="text-xs text-green-400 font-semibold tracking-wider mt-0.5">HIT</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border border-red-100/50">
            <p className="text-3xl font-black text-red-400">{state.missCount}</p>
            <p className="text-xs text-red-300 font-semibold tracking-wider mt-0.5">MISS</p>
          </div>
        </div>

        {/* Stats detail */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-2.5 text-center border border-yellow-100/50">
            <p className="text-xl font-bold text-amber-500">{state.perfectCount}</p>
            <p className="text-[10px] text-amber-400 font-semibold tracking-wider">PERFECT</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-2.5 text-center border border-cyan-100/50">
            <p className="text-xl font-bold text-cyan-500">{state.greatCount}</p>
            <p className="text-[10px] text-cyan-400 font-semibold tracking-wider">GREAT</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-2.5 text-center border border-orange-100/50">
            <p className="text-xl font-bold text-orange-400">{state.goodCount}</p>
            <p className="text-[10px] text-orange-300 font-semibold tracking-wider">GOOD</p>
          </div>
        </div>

        {/* Max combo */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-3 text-center border border-gray-100/50">
          <p className="text-xl font-bold text-gray-600">{state.maxCombo}</p>
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider">最大连击</p>
        </div>
      </div>

      {/* Cyber-rock completion message */}
      <div className="mb-6 relative">
        <div
          className="px-8 py-4 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D0D0D, #1A1A2E, #16213E)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #FF6B9D, #E040FB, #4DD0E1, #FFB347) 1',
            boxShadow: '0 0 30px rgba(224,64,251,0.3), 0 0 60px rgba(77,208,225,0.15), inset 0 0 30px rgba(255,107,157,0.1)',
          }}
        >
          {/* Neon scanline effect */}
          <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,107,157,0.3) 2px, rgba(255,107,157,0.3) 4px)' }} />
          <p
            className="text-2xl sm:text-3xl font-black tracking-wider text-center relative z-10"
            style={{
              background: 'linear-gradient(90deg, #FF6B9D, #E040FB, #4DD0E1, #FFB347, #FF6B9D)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shine 3s linear infinite',
              textShadow: '0 0 20px rgba(224,64,251,0.5)',
              filter: 'drop-shadow(0 0 10px rgba(77,208,225,0.4))',
            }}
          >
            一起竖起小指吧！
          </p>
          <p className="text-center text-xs mt-1 tracking-[0.2em] relative z-10" style={{ color: '#4DD0E1', opacity: 0.7, textShadow: '0 0 8px rgba(77,208,225,0.5)' }}>
            ☆ PINKY PROMISE ☆
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-white border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all"
        >
          返回选曲
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${song.coverColor}, ${song.coverColor}BB)` }}
        >
          再来一次 🔄
        </button>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'start',
    selectedSong: null,
    selectedDifficulty: 'easy',
    score: 0,
    combo: 0,
    maxCombo: 0,
    missCount: 0,
    perfectCount: 0,
    greatCount: 0,
    goodCount: 0,
    totalNotes: 0,
    isPaused: false,
  });

  const [resultState, setResultState] = useState<Omit<GameState, 'screen' | 'selectedSong' | 'selectedDifficulty' | 'isPaused'> | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback(() => {
    if (!gameState.selectedSong) return;
    setGameKey(prev => prev + 1);
    setGameState(prev => ({ ...prev, screen: 'playing' }));
  }, [gameState.selectedSong]);

  const handleGameEnd = useCallback((endState: Omit<GameState, 'screen' | 'selectedSong' | 'selectedDifficulty' | 'isPaused'>) => {
    setResultState(endState);
    setGameState(prev => ({ ...prev, screen: 'result', ...endState }));
  }, []);

  const handleRestart = useCallback(() => {
    setGameKey(prev => prev + 1);
    setGameState(prev => ({ ...prev, screen: 'playing' }));
  }, []);

  const handleBack = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      screen: 'start',
      score: 0,
      combo: 0,
      maxCombo: 0,
      missCount: 0,
      perfectCount: 0,
      greatCount: 0,
      goodCount: 0,
      totalNotes: 0,
    }));
    setResultState(null);
  }, []);

  return (
    <main className="min-h-screen">
      {gameState.screen === 'start' && (
        <StartScreen
          selectedSong={gameState.selectedSong}
          onSelectSong={(song) => setGameState(prev => ({ ...prev, selectedSong: song }))}
          selectedDifficulty={gameState.selectedDifficulty}
          onSelectDifficulty={(d) => setGameState(prev => ({ ...prev, selectedDifficulty: d }))}
          onStart={handleStart}
        />
      )}

      {gameState.screen === 'playing' && gameState.selectedSong && (
        <GamePlay
          key={gameKey}
          song={gameState.selectedSong}
          difficulty={gameState.selectedDifficulty}
          onEnd={handleGameEnd}
        />
      )}

      {gameState.screen === 'result' && resultState && gameState.selectedSong && (
        <ResultScreen
          state={resultState}
          song={gameState.selectedSong}
          difficulty={gameState.selectedDifficulty}
          onRestart={handleRestart}
          onBack={handleBack}
        />
      )}
    </main>
  );
}
