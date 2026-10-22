import check from "@tabler/icons/outline/check.svg?raw";
import chevronDown from "@tabler/icons/outline/chevron-down.svg?raw";
import heart from "@tabler/icons/filled/heart.svg?raw";
import lock from "@tabler/icons/outline/lock.svg?raw";
import playerPause from "@tabler/icons/outline/player-pause.svg?raw";
import playerPlay from "@tabler/icons/outline/player-play.svg?raw";
import repeat from "@tabler/icons/outline/repeat.svg?raw";
import repeatOnce from "@tabler/icons/outline/repeat-once.svg?raw";
import x from "@tabler/icons/outline/x.svg?raw";

const icons = {
  check,
  "chevron-down": chevronDown,
  heart,
  lock,
  "player-pause": playerPause,
  "player-play": playerPlay,
  repeat,
  "repeat-once": repeatOnce,
  x,
};

export type TablerIconName = keyof typeof icons;

export const createTablerIcon = (
  name: TablerIconName,
  className?: string,
): SVGSVGElement => {
  const parsed = new DOMParser().parseFromString(icons[name], "image/svg+xml");
  const source = parsed.documentElement;
  if (source.localName !== "svg") {
    throw new Error(`Invalid Tabler icon: ${name}`);
  }

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const attribute of Array.from(source.attributes)) {
    if (!["width", "height", "class"].includes(attribute.name)) {
      icon.setAttribute(attribute.name, attribute.value);
    }
  }
  icon.setAttribute("width", "1em");
  icon.setAttribute("height", "1em");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  if (className) icon.setAttribute("class", className);
  icon.replaceChildren(
    ...Array.from(source.childNodes, (child) =>
      document.importNode(child, true),
    ),
  );
  return icon;
};
