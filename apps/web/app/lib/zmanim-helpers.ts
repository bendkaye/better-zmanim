import { ZMANIM } from "@better-zmanim/shared";
import type { ZmanTimeResult, ZmanId } from "@better-zmanim/shared";

type DisplayCategory = "morning" | "afternoon" | "evening";

const CATEGORY_MAP: Record<string, DisplayCategory> = {
  dawn: "morning",
  morning: "morning",
  shma: "morning",
  tefila: "morning",
  midday: "afternoon",
  afternoon: "afternoon",
  evening: "evening",
  night: "evening",
};

export interface ZmanimGroup {
  label: DisplayCategory;
  zmanim: ZmanTimeResult[];
}

export function groupZmanimByCategory(zmanim: ZmanTimeResult[]): ZmanimGroup[] {
  const groups: Record<DisplayCategory, ZmanTimeResult[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const z of zmanim) {
    const zmanDef = ZMANIM[z.zmanId as ZmanId];
    if (!zmanDef) continue;
    const displayCat = CATEGORY_MAP[zmanDef.category] ?? "morning";
    groups[displayCat].push(z);
  }
  const order: DisplayCategory[] = ["morning", "afternoon", "evening"];
  return order
    .filter((cat) => groups[cat].length > 0)
    .map((cat) => ({ label: cat, zmanim: groups[cat] }));
}

export function findNextZman(zmanim: ZmanTimeResult[], now: Date): ZmanTimeResult | null {
  const nowMs = now.getTime();
  for (const z of zmanim) {
    if (!z.time) continue;
    if (new Date(z.time).getTime() > nowMs) return z;
  }
  return null;
}

export function countPastZmanim(zmanim: ZmanTimeResult[], now: Date): number {
  const nowMs = now.getTime();
  return zmanim.filter((z) => z.time !== null && new Date(z.time).getTime() <= nowMs).length;
}
