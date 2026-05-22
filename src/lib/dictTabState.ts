let activeTab: "attendance" | "visitors" = "attendance";
const listeners: Array<() => void> = [];

export function getDictTab() {
  return activeTab;
}

export function setDictTab(tab: "attendance" | "visitors") {
  activeTab = tab;
  listeners.forEach(fn => fn());
}

export function subscribeDictTab(fn: () => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i > -1) listeners.splice(i, 1);
  };
}
