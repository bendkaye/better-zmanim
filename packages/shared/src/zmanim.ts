import type { I18nLabels } from "./i18n";

export const ZMAN_CATEGORIES = {
  dawn: "dawn",
  morning: "morning",
  shma: "shma",
  tefila: "tefila",
  midday: "midday",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
} as const;

export type ZmanCategory =
  (typeof ZMAN_CATEGORIES)[keyof typeof ZMAN_CATEGORIES];

interface OpinionDef {
  names: I18nLabels;
  kosherZmanimMethod: string;
  defaultVisible: boolean;
}

interface ZmanDef {
  category: ZmanCategory;
  opinions: Record<string, OpinionDef>;
}

export const ZMANIM = {
  alos: {
    category: "dawn",
    opinions: {
      degrees_16_1: {
        names: {
          en: "Dawn (16.1°)",
          he: "עלות השחר",
          translit: "Alos HaShachar (16.1°)",
        },
        kosherZmanimMethod: "getAlos16Point1Degrees",
        defaultVisible: true,
      },
      degrees_19_8: {
        names: {
          en: "Dawn (19.8°)",
          he: "עלות השחר",
          translit: "Alos HaShachar (19.8°)",
        },
        kosherZmanimMethod: "getAlos19Point8Degrees",
        defaultVisible: false,
      },
      minutes_72: {
        names: {
          en: "Dawn (72 min)",
          he: "עלות השחר",
          translit: "Alos HaShachar (72 min)",
        },
        kosherZmanimMethod: "getAlos72",
        defaultVisible: false,
      },
      mga: {
        names: {
          en: "Dawn (MGA)",
          he: "עלות השחר (מג״א)",
          translit: "Alos HaShachar (MGA)",
        },
        kosherZmanimMethod: "getAlos72Zmanis",
        defaultVisible: false,
      },
    },
  },
  misheyakir: {
    category: "dawn",
    opinions: {
      degrees_10_2: {
        names: {
          en: "Misheyakir (10.2°)",
          he: "משיכיר",
          translit: "Misheyakir (10.2°)",
        },
        kosherZmanimMethod: "getMisheyakir10Point2Degrees",
        defaultVisible: true,
      },
      degrees_11: {
        names: {
          en: "Misheyakir (11°)",
          he: "משיכיר",
          translit: "Misheyakir (11°)",
        },
        kosherZmanimMethod: "getMisheyakir11Degrees",
        defaultVisible: false,
      },
    },
  },
  hanetz: {
    category: "morning",
    opinions: {
      standard: {
        names: {
          en: "Sunrise",
          he: "הנץ החמה",
          translit: "HaNetz HaChama",
        },
        kosherZmanimMethod: "getSunrise",
        defaultVisible: true,
      },
      elevated: {
        names: {
          en: "Sunrise (elevated)",
          he: "הנץ החמה (גובה)",
          translit: "HaNetz HaChama (elevated)",
        },
        kosherZmanimMethod: "getElevationAdjustedSunrise",
        defaultVisible: false,
      },
    },
  },
  sofZmanShma: {
    category: "shma",
    opinions: {
      gra: {
        names: {
          en: "Latest Shma (GRA)",
          he: 'סוף זמן ק"ש (גר"א)',
          translit: "Sof Zman Shma (GRA)",
        },
        kosherZmanimMethod: "getSofZmanShmaGRA",
        defaultVisible: true,
      },
      mga: {
        names: {
          en: "Latest Shma (MGA)",
          he: 'סוף זמן ק"ש (מג"א)',
          translit: "Sof Zman Shma (MGA)",
        },
        kosherZmanimMethod: "getSofZmanShmaMGA",
        defaultVisible: true,
      },
    },
  },
  sofZmanTefila: {
    category: "tefila",
    opinions: {
      gra: {
        names: {
          en: "Latest Tefila (GRA)",
          he: 'סוף זמן תפילה (גר"א)',
          translit: "Sof Zman Tefila (GRA)",
        },
        kosherZmanimMethod: "getSofZmanTfilaGRA",
        defaultVisible: true,
      },
      mga: {
        names: {
          en: "Latest Tefila (MGA)",
          he: 'סוף זמן תפילה (מג"א)',
          translit: "Sof Zman Tefila (MGA)",
        },
        kosherZmanimMethod: "getSofZmanTfilaMGA",
        defaultVisible: true,
      },
    },
  },
  chatzos: {
    category: "midday",
    opinions: {
      standard: {
        names: {
          en: "Midday",
          he: "חצות היום",
          translit: "Chatzos HaYom",
        },
        kosherZmanimMethod: "getChatzos",
        defaultVisible: true,
      },
    },
  },
  minchaGedola: {
    category: "afternoon",
    opinions: {
      standard: {
        names: {
          en: "Earliest Mincha",
          he: "מנחה גדולה",
          translit: "Mincha Gedola",
        },
        kosherZmanimMethod: "getMinchaGedola",
        defaultVisible: true,
      },
    },
  },
  minchaKetana: {
    category: "afternoon",
    opinions: {
      standard: {
        names: {
          en: "Mincha Ketana",
          he: "מנחה קטנה",
          translit: "Mincha Ketana",
        },
        kosherZmanimMethod: "getMinchaKetana",
        defaultVisible: true,
      },
    },
  },
  plagHamincha: {
    category: "afternoon",
    opinions: {
      standard: {
        names: {
          en: "Plag HaMincha",
          he: "פלג המנחה",
          translit: "Plag HaMincha",
        },
        kosherZmanimMethod: "getPlagHamincha",
        defaultVisible: true,
      },
    },
  },
  shkia: {
    category: "evening",
    opinions: {
      standard: {
        names: {
          en: "Sunset",
          he: "שקיעה",
          translit: "Shkia",
        },
        kosherZmanimMethod: "getSunset",
        defaultVisible: true,
      },
      elevated: {
        names: {
          en: "Sunset (elevated)",
          he: "שקיעה (גובה)",
          translit: "Shkia (elevated)",
        },
        kosherZmanimMethod: "getElevationAdjustedSunset",
        defaultVisible: false,
      },
    },
  },
  tzeis: {
    category: "night",
    opinions: {
      degrees_8_5: {
        names: {
          en: "Nightfall (8.5°)",
          he: "צאת הכוכבים",
          translit: "Tzeis HaKochavim (8.5°)",
        },
        kosherZmanimMethod: "getTzaisGeonim8Point5Degrees",
        defaultVisible: true,
      },
      minutes_72: {
        names: {
          en: "Nightfall (72 min)",
          he: "צאת הכוכבים (72 דקות)",
          translit: "Tzeis HaKochavim (72 min)",
        },
        kosherZmanimMethod: "getTzais72",
        defaultVisible: false,
      },
      rabbeinuTam: {
        names: {
          en: "Nightfall (R' Tam)",
          he: 'צאת הכוכבים (ר"ת)',
          translit: "Tzeis HaKochavim (Rabbeinu Tam)",
        },
        kosherZmanimMethod: "getTzais72Zmanis",
        defaultVisible: false,
      },
    },
  },
  candleLighting: {
    category: "evening",
    opinions: {
      standard: {
        names: {
          en: "Candle Lighting",
          he: "הדלקת נרות",
          translit: "Hadlakas Neiros",
        },
        kosherZmanimMethod: "getCandleLighting",
        defaultVisible: true,
      },
    },
  },
  havdalah: {
    category: "night",
    opinions: {
      standard: {
        names: {
          en: "Havdalah",
          he: "הבדלה",
          translit: "Havdalah",
        },
        kosherZmanimMethod: "getTzaisGeonim8Point5Degrees",
        defaultVisible: true,
      },
    },
  },
} as const satisfies Record<string, ZmanDef>;

export type ZmanId = keyof typeof ZMANIM;
export type OpinionId<Z extends ZmanId> = keyof (typeof ZMANIM)[Z]["opinions"];
