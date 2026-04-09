export interface Location {
  lat: number;
  lng: number;
  elevation?: number;
  name: string;
  timeZone: string;
}

export const DEFAULT_LOCATIONS = {
  jerusalem: {
    lat: 31.7683,
    lng: 35.2137,
    elevation: 800,
    name: "Jerusalem, Israel",
    timeZone: "Asia/Jerusalem",
  },
  newYork: {
    lat: 40.7128,
    lng: -74.006,
    name: "New York, NY",
    timeZone: "America/New_York",
  },
  losAngeles: {
    lat: 34.0522,
    lng: -118.2437,
    name: "Los Angeles, CA",
    timeZone: "America/Los_Angeles",
  },
  london: {
    lat: 51.5074,
    lng: -0.1278,
    name: "London, UK",
    timeZone: "Europe/London",
  },
} as const satisfies Record<string, Location>;
