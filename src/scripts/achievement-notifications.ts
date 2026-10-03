import type { AchievementUnlockDetail } from './site-state';
import { CHANGE_EVENT, UNLOCK_EVENT, effectiveTheme, prefersReducedMotion } from './site-state';
import { themes } from '../data/themes';

export const setupAchievementNotifications = (root: HTMLElement) => {
  const host = root.querySelector<HTMLElement>('[data-achievement-rewards]');
  const previewTemplate = root.querySelector<HTMLTemplateElement>('[data-sm-theme-preview-template]');
  if (!host || !previewTemplate || host.dataset.bound === 'true') return;
  host.dataset.bound = 'true';

  const queue: AchievementUnlockDetail[] = [];
  let activeToast: HTMLElement | null = null;
  let dismissTimer = 0;
  let isClosing = false;

  const finishActiveToast = () => {
    if (!activeToast || isClosing) return;
    isClosing = true;
    window.clearTimeout(dismissTimer);
    activeToast.dataset.visible = 'false';
    const toast = activeToast;
    const remove = () => {
      toast.remove();
      if (activeToast === toast) activeToast = null;
      isClosing = false;
      showNext();
    };
    if (prefersReducedMotion()) remove();
    else window.setTimeout(remove, 240);
  };

  const showNext = () => {
    if (activeToast || !queue.length) return;
    const detail = queue.shift()!;
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
    dismiss.addEventListener('click', finishActiveToast);
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

    activeToast = toast;
    isClosing = false;
    host.append(toast);
    if (prefersReducedMotion()) toast.dataset.visible = 'true';
    else requestAnimationFrame(() => { if (activeToast === toast) toast.dataset.visible = 'true'; });
    dismissTimer = window.setTimeout(finishActiveToast, 7000);
  };

  window.addEventListener(UNLOCK_EVENT, (event) => {
    queue.push((event as CustomEvent<AchievementUnlockDetail>).detail);
    showNext();
  });
  window.addEventListener(CHANGE_EVENT, () => {
    if (activeToast) activeToast.dataset.siteTheme = effectiveTheme();
  });
};
