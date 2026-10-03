import { achievements, type AchievementId } from '../data/achievements';
import { prefersReducedMotion, unlockAchievement } from './site-state';

let clockOffset = 0;
let clockSync: Promise<void> | null = null;

// The server's Date header keeps weekday checks independent of a skewed local clock; falls back to local time.
const syncClock = () => (clockSync ??= fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
	.then((response) => {
		const serverTime = Date.parse(response.headers.get('date') ?? '');
		if (Number.isFinite(serverTime)) clockOffset = serverTime - Date.now();
	})
	.catch(() => {}));

const trustedNow = () => new Date(Date.now() + clockOffset);

let initialized = false;
export const initHoldTriggers = () => {
	if (initialized) return;
	initialized = true;
	let suppressClick = false;

	document.addEventListener('click', (event) => {
		if (!suppressClick) return;
		suppressClick = false;
		if ((event.target as Element).closest('[data-hold-unlock]')) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}, true);

	document.addEventListener('pointerdown', (event) => {
		suppressClick = false;
		if (event.button !== 0) return;
		const element = (event.target as Element).closest<HTMLElement>('[data-hold-unlock]');
		const id = element?.dataset.holdUnlock as AchievementId | undefined;
		const hold = id && id in achievements ? (achievements[id] as { hold?: { ms: number; weekday?: number } }).hold : undefined;
		if (!element || !hold) return;

		void syncClock();
		const abort = new AbortController();
		const finish = () => {
			window.clearTimeout(timer);
			element.classList.remove('is-holding');
			abort.abort();
		};
		const timer = window.setTimeout(async () => {
			await syncClock();
			finish();
			if (hold.weekday !== undefined && trustedNow().getDay() !== hold.weekday) return;
			suppressClick = true;
			unlockAchievement(id);
		}, hold.ms);

		if (!prefersReducedMotion()) {
			element.style.setProperty('--hold-ms', `${hold.ms}ms`);
			element.classList.add('is-holding');
		}
		for (const name of ['pointerup', 'pointercancel', 'pointerleave'] as const) element.addEventListener(name, finish, { signal: abort.signal });
		element.addEventListener('contextmenu', (menuEvent) => menuEvent.preventDefault(), { signal: abort.signal });
	});
};
