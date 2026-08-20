export type Stop = {
  name: string;
  lat: number;
  lng: number;
};

export type BusRoute = {
  id: string;
  name: string;
  stops: Stop[];
};

export type Bus = {
  id: string;
  bus_number: string;
  route_id: string | null;
};

export type LiveLocation = {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  updated_at: string;
};

/** A bus joined with its route and latest known position. */
export type TrackedBus = {
  bus: Bus;
  route: BusRoute | null;
  location: LiveLocation | null;
};

export type LatLng = { lat: number; lng: number };
