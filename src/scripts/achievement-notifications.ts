import type { AchievementUnlockDetail } from './site-state';
import { CHANGE_EVENT, UNLOCK_EVENT, effectiveTheme, prefersReducedMotion } from './site-state';
import { themes } from '../data/themes';
import { applyThemePreviewPalette } from './theme-preview';

export const setupAchievementNotifications = (root: HTMLElement) => {
  const host = root.querySelector<HTMLElement>('[data-achievement-rewards]');
  const previewTemplate = root.querySelector<HTMLTemplateElement>('[data-sm-theme-preview-template]');
  if (!host || !previewTemplate || host.dataset.bound === 'true') return;
  host.dataset.bound = 'true';

  const queue: AchievementUnlockDetail[] = [];
  const visibleToasts: HTMLElement[] = [];
  const timers = new WeakMap<HTMLElement, ToastTimerState>();
  const TOAST_DURATION_MS = 5000;
  const MAX_VISIBLE_TOASTS = 3;

  type ToastTimerState = {
    progress: HTMLElement;
    remaining: number;
    startedAt: number;
    timeout: number;
    frame: number;
    reducedMotionTick: number;
    removeTimer: number;
    paused: boolean;
    closing: boolean;
  };

  const clearToastTimers = (state: ToastTimerState) => {
    window.clearTimeout(state.timeout);
    window.clearTimeout(state.reducedMotionTick);
    window.clearTimeout(state.removeTimer);
    if (state.frame) window.cancelAnimationFrame(state.frame);
    state.timeout = 0;
    state.reducedMotionTick = 0;
    state.removeTimer = 0;
    state.frame = 0;
  };

  const updateProgress = (state: ToastTimerState) => {
    if (state.paused || state.closing) return;
    const remaining = Math.max(0, state.remaining - (performance.now() - state.startedAt));
    const ratio = remaining / TOAST_DURATION_MS;
    const shownRatio = prefersReducedMotion() ? Math.ceil(ratio * 5) / 5 : ratio;
    state.progress.style.transform = `scaleX(${shownRatio})`;
    if (remaining <= 0) return;
    if (prefersReducedMotion()) state.reducedMotionTick = window.setTimeout(() => updateProgress(state), 500);
    else state.frame = window.requestAnimationFrame(() => updateProgress(state));
  };

  const startToastTimer = (toast: HTMLElement, state: ToastTimerState) => {
    if (state.closing) return;
    state.paused = false;
    state.startedAt = performance.now();
    state.timeout = window.setTimeout(() => dismissToast(toast), state.remaining);
    updateProgress(state);
  };

  const pauseToastTimer = (state: ToastTimerState) => {
    if (state.paused || state.closing) return;
    state.remaining = Math.max(0, state.remaining - (performance.now() - state.startedAt));
    state.paused = true;
    clearToastTimers(state);
    state.progress.style.transform = `scaleX(${state.remaining / TOAST_DURATION_MS})`;
  };

  const dismissToast = (toast: HTMLElement) => {
    const state = timers.get(toast);
    if (!state || state.closing) return;
    state.closing = true;
    clearToastTimers(state);
    toast.dataset.visible = 'false';
    const remove = () => {
      toast.remove();
      const index = visibleToasts.indexOf(toast);
      if (index >= 0) visibleToasts.splice(index, 1);
      showNext();
    };
    if (prefersReducedMotion()) remove();
    else state.removeTimer = window.setTimeout(remove, 220);
  };

  const createToast = (detail: AchievementUnlockDetail) => {
    const toast = document.createElement('section');
    toast.className = 'sm-reward-toast sm-theme-profile';
    toast.dataset.siteTheme = effectiveTheme();
    toast.dataset.visible = 'false';
    toast.setAttribute('role', 'group');
    toast.setAttribute('aria-label', `${detail.name} achievement unlocked`);

    const head = document.createElement('div');
    head.className = 'sm-reward-head';
    const kicker = document.createElement('span');
    kicker.className = 'sm-reward-kicker';
    kicker.textContent = 'Achievement Unlocked!';
    const dismiss = document.createElement('button');
    dismiss.className = 'sm-reward-dismiss';
    dismiss.type = 'button';
    dismiss.setAttribute('aria-label', 'Dismiss achievement notification');
    dismiss.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>';
    dismiss.addEventListener('click', () => dismissToast(toast));
    head.append(kicker, dismiss);

    const achievement = document.createElement('strong');
    achievement.className = 'sm-reward-achievement';
    achievement.textContent = detail.name;
    toast.append(head, achievement);

    const rewards = detail.rewards ?? [];
    if (rewards.length) {
      const list = document.createElement('div');
      list.className = 'sm-reward-list';
      rewards.forEach((reward) => {
        const item = document.createElement('div');
        item.className = 'sm-reward-item';
        const name = document.createElement('strong');
        name.className = 'sm-reward-name';
        name.textContent = reward.name;
        const description = document.createElement('p');
        description.className = 'sm-reward-description';
        description.textContent = reward.description;
        item.append(name, description);

        const theme = reward.themeId ? themes.find((candidate) => candidate.id === reward.themeId) : undefined;
        if (theme) {
          const preview = previewTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
          if (preview) {
            preview.dataset.siteTheme = theme.id;
            preview.style.setProperty('--sm-mini-swatch', theme.swatch);
            applyThemePreviewPalette(preview, theme);
            preview.querySelector<HTMLElement>('[data-sm-mini-name]')!.textContent = theme.name;
            const previewWrap = document.createElement('div');
            previewWrap.className = 'sm-reward-preview';
            previewWrap.append(preview);
            item.append(previewWrap);
          }
        }
        list.append(item);
      });
      toast.append(list);
    }

    const progress = document.createElement('span');
    progress.className = 'sm-reward-progress';
    progress.setAttribute('aria-hidden', 'true');
    toast.append(progress);

    const timerState: ToastTimerState = {
      progress,
      remaining: TOAST_DURATION_MS,
      startedAt: 0,
      timeout: 0,
      frame: 0,
      reducedMotionTick: 0,
      removeTimer: 0,
      paused: false,
      closing: false,
    };
    timers.set(toast, timerState);

    toast.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') pauseToastTimer(timerState);
    });
    toast.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'touch' && timerState.paused) startToastTimer(toast, timerState);
    });
    toast.addEventListener('focusin', () => pauseToastTimer(timerState));
    toast.addEventListener('focusout', (event) => {
      if (!toast.contains(event.relatedTarget as Node | null) && timerState.paused) startToastTimer(toast, timerState);
    });

    host.append(toast);
    visibleToasts.push(toast);
    if (prefersReducedMotion()) toast.dataset.visible = 'true';
    else requestAnimationFrame(() => { if (toast.isConnected) toast.dataset.visible = 'true'; });
    startToastTimer(toast, timerState);
  };

  const showNext = () => {
    while (queue.length && visibleToasts.length < MAX_VISIBLE_TOASTS) createToast(queue.shift()!);
  };

  window.addEventListener(UNLOCK_EVENT, (event) => {
    queue.push((event as CustomEvent<AchievementUnlockDetail>).detail);
    showNext();
  });
  window.addEventListener(CHANGE_EVENT, () => {
    visibleToasts.forEach((toast) => { toast.dataset.siteTheme = effectiveTheme(); });
  });
};
