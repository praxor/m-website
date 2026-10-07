import { loadMusicPlaylist } from './music-library';
import type { AchievementId } from '../data/achievements';
import { CHANGE_EVENT, getAchievements, prefersReducedMotion, recordArtworkView, unlockAchievement } from './site-state';

const FLYING_PRAXOR_ACHIEVEMENT: AchievementId = 'creditsFlyingPraxor';
const SCROLL_DURATION_MS = 78_000;
const ENDING_FADE_MS = 5_000;
const MUSIC_FADE_START_MS = 77_000;
const MUSIC_STOP_MS = 82_000;
const AUDIO_VOLUME = .72;
const FLYBY_DURATION_MS = 3_300;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const initializeCreditsSequence = (baseUrl: string) => {
  const screen = document.querySelector<HTMLElement>('[data-credits-screen]');
  const viewport = screen?.querySelector<HTMLElement>('[data-credits-viewport]');
  const roll = screen?.querySelector<HTMLElement>('[data-credits-roll]');
  const ending = screen?.querySelector<HTMLElement>('[data-credits-ending]');
  const controls = screen?.querySelector<HTMLElement>('[data-credits-controls]');
  const closeButton = screen?.querySelector<HTMLButtonElement>('[data-credits-close]');
  const muteButton = screen?.querySelector<HTMLButtonElement>('[data-credits-mute]');
  const muteMark = screen?.querySelector<SVGPathElement>('[data-mute-mark]');
  const startAudioButton = screen?.querySelector<HTMLButtonElement>('[data-credits-audio-start]');
  const returnButton = screen?.querySelector<HTMLButtonElement>('[data-credits-return]');
  const flyingPraxor = screen?.querySelector<HTMLButtonElement>('[data-flying-praxor]');
  const creditsAudio = screen?.querySelector<HTMLAudioElement>('[data-credits-audio]');
  const blocks = screen ? Array.from(screen.querySelectorAll<HTMLElement>('[data-credit-block]')) : [];
  if (!screen || !viewport || !roll || !ending || !controls || !closeButton || !muteButton || !muteMark || !startAudioButton || !returnButton || !flyingPraxor || !creditsAudio || !blocks.length || screen.dataset.initialized === 'true') return;
  screen.dataset.initialized = 'true';

  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const reducedMotion = prefersReducedMotion();
  let controlsTimer = 0;
  let flybyTimer = 0;
  let presentationFrame = 0;
  let reducedMotionTimer = 0;
  let flybyFrame = 0;
  let screenAnimation: Animation | null = null;
  let artworkObserver: IntersectionObserver | null = null;
  let presentationStartedAt = 0;
  let isEnding = false;
  let isLeaving = false;
  let isCleaningUp = false;
  let audioStartTask: Promise<boolean> | null = null;

  const revealControls = () => {
    if (signal.aborted) return;
    controls.dataset.visible = 'true';
    window.clearTimeout(controlsTimer);
    controlsTimer = window.setTimeout(() => {
      if (!controls.matches(':focus-within')) controls.dataset.visible = 'false';
    }, 4200);
  };

  const hideFlyingPraxor = () => {
    if (flybyFrame) cancelAnimationFrame(flybyFrame);
    flybyFrame = 0;
    flyingPraxor.hidden = true;
    flyingPraxor.disabled = true;
    flyingPraxor.dataset.visible = 'false';
    flyingPraxor.setAttribute('aria-hidden', 'true');
  };

  const cleanup = () => {
    if (isCleaningUp) return;
    isCleaningUp = true;
    lifecycle.abort();
    window.clearTimeout(controlsTimer);
    window.clearTimeout(flybyTimer);
    window.clearTimeout(reducedMotionTimer);
    if (presentationFrame) cancelAnimationFrame(presentationFrame);
    artworkObserver?.disconnect();
    hideFlyingPraxor();
    if (!isLeaving) screenAnimation?.cancel();
    creditsAudio.pause();
    creditsAudio.volume = AUDIO_VOLUME;
    creditsAudio.removeAttribute('src');
    creditsAudio.load();
  };

  const leaveCredits = () => {
    if (isLeaving || signal.aborted) return;
    isLeaving = true;
    const referrer = document.referrer;
    const navigate = () => {
      cleanup();
      if (referrer && new URL(referrer).origin === window.location.origin && window.history.length > 1) window.history.back();
      else window.location.assign(baseUrl);
    };
    if (reducedMotion) return navigate();
    screenAnimation?.cancel();
    screenAnimation = screen.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(.985)' },
    ], { duration: 420, easing: 'ease-in', fill: 'forwards' });
    void screenAnimation.finished.catch(() => undefined).then(navigate);
  };

  const revealReturnButton = () => {
    if (signal.aborted) return;
    returnButton.hidden = false;
    requestAnimationFrame(() => returnButton.setAttribute('data-visible', 'true'));
  };

  const handleActivity = () => {
    revealControls();
  };

  const isFlybySuppressed = () => getAchievements().some((achievement) => achievement.id === FLYING_PRAXOR_ACHIEVEMENT && achievement.unlocked);

  const showFlyingPraxor = () => {
    if (isFlybySuppressed() || signal.aborted || isLeaving) return;
    const bounds = viewport.getBoundingClientRect();
    const spriteWidth = flyingPraxor.getBoundingClientRect().width || 112;
    const spriteHeight = flyingPraxor.getBoundingClientRect().height || spriteWidth;
    const fromLeft = Math.random() < .5;
    const direction = fromLeft ? 1 : -1;
    const trail = flyingPraxor.querySelector<HTMLElement>('.flying-praxor-trail');
    const targetX = randomBetween(24, Math.max(25, bounds.width - spriteWidth - 24));
    const targetY = randomBetween(bounds.height * .32, bounds.height * .6);
    const startX = fromLeft ? -spriteWidth - 20 : bounds.width + 20;
    const enterDuration = 1100;
    const holdDuration = 900;
    const fallDuration = FLYBY_DURATION_MS - enterDuration - holdDuration;
    const startedAt = performance.now();
    flyingPraxor.hidden = false;
    flyingPraxor.disabled = false;
    flyingPraxor.style.left = '0px';
    flyingPraxor.style.top = '0px';
    flyingPraxor.style.visibility = 'visible';
    flyingPraxor.style.pointerEvents = 'auto';
    flyingPraxor.dataset.visible = 'true';
    flyingPraxor.setAttribute('aria-hidden', 'false');
    const setTrail = (vx: number, vy: number) => {
      if (!trail) return;
      const speed = Math.hypot(vx, vy);
      trail.style.width = `${clamp(speed * .35, 0, 520)}px`;
      trail.style.opacity = String(clamp(speed / 900, 0, 1));
      trail.style.transform = `translateY(-50%) rotate(${Math.atan2(-vy, -vx)}rad)`;
    };
    setTrail(0, 0);
    if (reducedMotion) {
      flyingPraxor.style.opacity = '1';
      flyingPraxor.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
      flybyTimer = window.setTimeout(hideFlyingPraxor, FLYBY_DURATION_MS);
      return;
    }
    let lastX = startX;
    let lastY = targetY;
    let lastT = startedAt;
    const stepFlyby = (timestamp: number) => {
      if (signal.aborted || isFlybySuppressed()) return hideFlyingPraxor();
      const elapsed = timestamp - startedAt;
      let x = targetX;
      let y = targetY;
      let opacity = 1;
      if (elapsed < enterDuration) {
        const progress = elapsed / enterDuration;
        const eased = 1 - (1 - progress) ** 3;
        x = startX + (targetX - startX) * eased;
      } else if (elapsed >= enterDuration + holdDuration) {
        const progress = clamp((elapsed - enterDuration - holdDuration) / fallDuration, 0, 1);
        x += direction * 72 * progress;
        y += (bounds.height + spriteHeight - targetY) * progress * progress;
        opacity = 1 - clamp((progress - .68) / .32, 0, 1);
      }
      const dt = Math.max(timestamp - lastT, 1) / 1000;
      setTrail((x - lastX) / dt, (y - lastY) / dt);
      lastX = x;
      lastY = y;
      lastT = timestamp;
      flyingPraxor.style.opacity = String(opacity);
      flyingPraxor.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (elapsed >= FLYBY_DURATION_MS) return hideFlyingPraxor();
      flybyFrame = requestAnimationFrame(stepFlyby);
    };
    flybyFrame = requestAnimationFrame(stepFlyby);
  };

  const startCreditsMusic = (): Promise<boolean> => {
    if (audioStartTask) return audioStartTask;
    audioStartTask = (async () => {
      try {
        const playlist = await loadMusicPlaylist(`${baseUrl}musicplayer/playlists/all.json`);
        if (signal.aborted || isEnding || isLeaving) return false;
        const track = playlist.tracks?.find((candidate) => candidate.title?.toLowerCase().includes('oyasumi'));
        if (!track?.src) throw new Error('Oyasumi was not found in the music library.');
        creditsAudio.src = new URL(track.src, document.baseURI).href;
        creditsAudio.volume = AUDIO_VOLUME;
        creditsAudio.load();
        await creditsAudio.play();
        startAudioButton.hidden = true;
        return true;
      } catch {
        if (!signal.aborted && !isEnding && !isLeaving) startAudioButton.hidden = false;
        return false;
      }
    })();
    void audioStartTask.then((started) => { if (!started) audioStartTask = null; });
    return audioStartTask;
  };

  const updatePresentation = (timestamp: number) => {
    if (signal.aborted || isLeaving) return;
    const elapsed = Math.max(0, timestamp - presentationStartedAt);
    const progress = clamp(elapsed / SCROLL_DURATION_MS, 0, 1);
    if (!reducedMotion) {
      const finalY = viewport.clientHeight / 2 - ending.offsetTop - ending.offsetHeight / 2;
      const y = viewport.clientHeight + (finalY - viewport.clientHeight) * progress;
      roll.style.transform = `translate3d(0,${y}px,0)`;
    }

    const endingProgress = reducedMotion ? Number(elapsed >= SCROLL_DURATION_MS) : clamp((elapsed - (SCROLL_DURATION_MS - ENDING_FADE_MS)) / ENDING_FADE_MS, 0, 1);
    ending.style.opacity = String(1 - endingProgress);
    if (elapsed >= MUSIC_FADE_START_MS) {
      isEnding = true;
      startAudioButton.hidden = true;
      if (creditsAudio.src && !creditsAudio.paused) {
        creditsAudio.volume = AUDIO_VOLUME * (1 - clamp((elapsed - MUSIC_FADE_START_MS) / (MUSIC_STOP_MS - MUSIC_FADE_START_MS), 0, 1));
      }
    }
    if (elapsed >= MUSIC_STOP_MS) {
      if (!creditsAudio.paused) creditsAudio.pause();
      creditsAudio.volume = AUDIO_VOLUME;
      presentationFrame = 0;
      reducedMotionTimer = 0;
      revealReturnButton();
      return;
    }
    if (reducedMotion) reducedMotionTimer = window.setTimeout(() => updatePresentation(performance.now()), 120);
    else presentationFrame = requestAnimationFrame(updatePresentation);
  };

  artworkObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < .8) return;
      const block = entry.target as HTMLElement;
      block.classList.add('is-visible');
      block.querySelectorAll<HTMLElement>('[data-credit-art]').forEach((art) => art.classList.add('is-visible'));
      artworkObserver?.unobserve(block);
    });
  }, { root: viewport, threshold: [.8] });
  blocks.forEach((block) => artworkObserver?.observe(block));
  if (reducedMotion) {
    blocks.forEach((block) => {
      block.classList.add('is-visible');
      block.querySelectorAll<HTMLElement>('[data-credit-art]').forEach((art) => art.classList.add('is-visible'));
    });
    viewport.style.overflowY = 'auto';
    roll.style.position = 'relative';
    roll.style.transform = 'none';
  }

  screen.addEventListener('pointermove', handleActivity, { passive: true, signal });
  screen.addEventListener('touchmove', handleActivity, { passive: true, signal });
  screen.addEventListener('touchstart', revealControls, { passive: true, signal });
  document.addEventListener('keydown', (event) => {
    handleActivity();
    if (event.key === 'Escape') {
      event.preventDefault();
      leaveCredits();
    }
  }, { capture: true, signal });
  screen.addEventListener('click', (event) => {
    const target = event.target as Element;
    const creditsArtwork = target.closest<HTMLElement>('[data-credits-art]');
    if (creditsArtwork) recordArtworkView('credits', creditsArtwork.dataset.creditsArt || '');
  }, { signal });
  flyingPraxor.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    unlockAchievement(FLYING_PRAXOR_ACHIEVEMENT);
  }, { signal });
  window.addEventListener(CHANGE_EVENT, () => {
    if (isFlybySuppressed()) hideFlyingPraxor();
  }, { signal });
  closeButton.addEventListener('click', leaveCredits, { signal });
  muteButton.addEventListener('click', () => {
    creditsAudio.muted = !creditsAudio.muted;
    muteButton.setAttribute('aria-pressed', String(creditsAudio.muted));
    muteButton.setAttribute('aria-label', creditsAudio.muted ? 'Unmute credits audio' : 'Mute credits audio');
    muteButton.title = creditsAudio.muted ? 'Unmute credits audio' : 'Mute credits audio';
    muteMark.style.display = creditsAudio.muted ? 'block' : 'none';
    revealControls();
  }, { signal });
  startAudioButton.addEventListener('click', () => { revealControls(); void startCreditsMusic(); }, { signal });
  returnButton.addEventListener('click', leaveCredits, { signal });
  document.addEventListener('astro:before-swap', cleanup, { once: true, signal });

  if (!reducedMotion) {
    screenAnimation = screen.animate([
      { opacity: 0, transform: 'scale(1.015)' },
      { opacity: 1, transform: 'scale(1)' },
    ], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  controlsTimer = window.setTimeout(revealControls, 900);
  presentationStartedAt = performance.now();
  flybyTimer = window.setTimeout(showFlyingPraxor, randomBetween(24_000, 52_000));
  void startCreditsMusic();
  updatePresentation(presentationStartedAt);
};
