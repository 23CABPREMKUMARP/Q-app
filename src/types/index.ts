export interface BusLocation {
  lat: number;
  lng: number;
  rotation: number;
}

export interface BusPathNode {
  lat: number;
  lng: number;
}

export interface BusStop {
  _id: string;
  stopName: string;
  lat: number;
  lng: number;
  type: 'major' | 'small';
}

export interface BusData {
  _id: string;
  busNumber: string;
  busCode: string;
  status: string;
  speed: number;
  fare: number;
  availableSeats: number;
  departureTime: string;
  arrivalTime: string;
  currentStop?: string;
  nextStop?: string;
  location: BusLocation;
  routeId?: {
    routeName: string;
    from: string;
    to: string;
    path: BusPathNode[];
    stops: BusStop[];
  };
}


export interface MapLayers {
  showBuses: boolean;
  showRoutes: boolean;
  showMajorStops: boolean;
  showSmallStops: boolean;
  showTraffic: boolean;
  showBuildings: boolean;
}
