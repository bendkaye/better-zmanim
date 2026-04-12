import type { Language } from "./i18n";
import type { Location } from "./location";
import type { ZmanId } from "./zmanim";
import { ZMANIM } from "./zmanim";

export interface ZmanimPreferences {
  visibleOpinions: Record<string, boolean>;
  primaryOpinions: Record<ZmanId, string>;
  use24Hour: boolean;
  showSeconds: boolean;
  language: Language;
  candleLightingMinutes: number;
  savedLocations: Location[];
  activeLocationIndex: number;
}

export function buildDefaultVisibleOpinions(): Record<string, boolean> {
  const visible: Record<string, boolean> = {};
  for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
    const opinions = ZMANIM[zmanId].opinions;
    for (const [opinionId, opinion] of Object.entries(opinions)) {
      visible[`${zmanId}:${opinionId}`] = (
        opinion as { defaultVisible: boolean }
      ).defaultVisible;
    }
  }
  return visible;
}

export function buildDefaultPrimaryOpinions(): Record<ZmanId, string> {
  const primary = {} as Record<ZmanId, string>;
  for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
    const opinions = Object.entries(ZMANIM[zmanId].opinions);
    const firstVisible = opinions.find(
      ([_, op]) => (op as { defaultVisible: boolean }).defaultVisible,
    );
    primary[zmanId] = firstVisible ? firstVisible[0] : (opinions[0]?.[0] ?? "");
  }
  return primary;
}

export const DEFAULT_PREFERENCES: ZmanimPreferences = {
  visibleOpinions: buildDefaultVisibleOpinions(),
  primaryOpinions: buildDefaultPrimaryOpinions(),
  use24Hour: false,
  showSeconds: false,
  language: "en",
  candleLightingMinutes: 18,
  savedLocations: [],
  activeLocationIndex: 0,
};
