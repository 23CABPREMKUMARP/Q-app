import { BusData } from "../types";

export const MOCK_BUSES: BusData[] = [
  {
    _id: "bus1",
    busNumber: "TN-38-EF-2025",
    busCode: "1024",
    status: "Running",
    speed: 45,
    fare: 1,
    availableSeats: 35,
    departureTime: "08:00 AM",
    arrivalTime: "09:30 AM",
    currentStop: "Gandhipuram",
    location: { lat: 10.9996, lng: 76.9702, rotation: 50 },
    routeId: {
      routeName: "Coimbatore → Mettupalayam",
      from: "Gandhipuram",
      to: "Mettupalayam",
      path: [
        { lat: 10.9996, lng: 76.9702 }, // Gandhipuram
        { lat: 11.0500, lng: 76.9600 }, // Thudiyalur
        { lat: 11.1500, lng: 76.9500 }, // Periyanaickenpalayam
        { lat: 11.2500, lng: 76.9400 }, // Karamadai
        { lat: 11.3000, lng: 76.9366 }  // Mettupalayam
      ],
      stops: [
        { _id: "s1", stopName: "Gandhipuram Central", lat: 10.9996, lng: 76.9702, type: 'major' },
        { _id: "s2", stopName: "Thudiyalur Hub", lat: 11.0500, lng: 76.9600, type: 'major' },
        { _id: "s3", stopName: "Karamadai Point", lat: 11.2500, lng: 76.9400, type: 'major' },
        { _id: "s4", stopName: "Mettupalayam Terminal", lat: 11.3000, lng: 76.9366, type: 'major' }
      ]
    }
  },
  {
    _id: "bus2",
    busNumber: "TN-38-XY-9999",
    busCode: "9999",
    status: "Boarding",
    speed: 0,
    fare: 1,
    availableSeats: 22,
    departureTime: "09:30 AM",
    arrivalTime: "11:30 AM",
    currentStop: "Ukkadam",
    location: { lat: 10.9940, lng: 76.9548, rotation: 180 },
    routeId: {
      routeName: "Coimbatore → Pollachi",
      from: "Ukkadam",
      to: "Pollachi",
      path: [
        { lat: 10.9940, lng: 76.9548 }, // Ukkadam
        { lat: 10.8500, lng: 76.9800 }, // Kinathukadavu
        { lat: 10.6620, lng: 77.0060 }  // Pollachi
      ],
      stops: [
        { _id: "s5", stopName: "Ukkadam Hub", lat: 10.9940, lng: 76.9548, type: 'major' },
        { _id: "s6", stopName: "Kinathukadavu Stop", lat: 10.8500, lng: 76.9800, type: 'major' },
        { _id: "s7", stopName: "Pollachi Terminal", lat: 10.6620, lng: 77.0060, type: 'major' }
      ]
    }
  },
  {
    _id: "bus3",
    busNumber: "TN-38-AM-1111",
    busCode: "1111",
    status: "Running",
    speed: 55,
    fare: 1,
    availableSeats: 18,
    departureTime: "07:30 AM",
    arrivalTime: "09:00 AM",
    currentStop: "SITRA",
    location: { lat: 11.0300, lng: 77.0400, rotation: 90 },
    routeId: {
      routeName: "Coimbatore → Avinashi",
      from: "Coimbatore",
      to: "Avinashi",
      path: [
        { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        { lat: 11.0300, lng: 77.0400 }, // SITRA
        { lat: 11.1000, lng: 77.1500 }, // Karumathampatti
        { lat: 11.1930, lng: 77.2680 }  // Avinashi
      ],
      stops: [
        { _id: "s8", stopName: "Coimbatore Junction", lat: 11.0168, lng: 76.9558, type: 'major' },
        { _id: "s9", stopName: "SITRA Hub", lat: 11.0300, lng: 77.0400, type: 'major' },
        { _id: "s10", stopName: "Avinashi Terminal", lat: 11.1930, lng: 77.2680, type: 'major' }
      ]
    }
  },
  {
    _id: "bus4",
    busNumber: "TN-38-PL-4444",
    busCode: "4444",
    status: "Running",
    speed: 48,
    fare: 1,
    availableSeats: 40,
    departureTime: "10:00 AM",
    arrivalTime: "11:30 AM",
    currentStop: "Singanallur",
    location: { lat: 11.0000, lng: 77.0300, rotation: 110 },
    routeId: {
      routeName: "Coimbatore → Palladam",
      from: "Coimbatore",
      to: "Palladam",
      path: [
        { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        { lat: 11.0000, lng: 77.0300 }, // Singanallur
        { lat: 11.0200, lng: 77.1200 }, // Sulur
        { lat: 11.0000, lng: 77.2880 }  // Palladam
      ],
      stops: [
        { _id: "s11", stopName: "Singanallur Bus Stand", lat: 11.0000, lng: 77.0300, type: 'major' },
        { _id: "s12", stopName: "Sulur Hub", lat: 11.0200, lng: 77.1200, type: 'major' },
        { _id: "s13", stopName: "Palladam Stand", lat: 11.0000, lng: 77.2880, type: 'major' }
      ]
    }
  },
  {
    _id: "bus5",
    busNumber: "TN-38-AR-5555",
    busCode: "5555",
    status: "Boarding",
    speed: 0,
    fare: 1,
    availableSeats: 30,
    departureTime: "11:00 AM",
    arrivalTime: "12:30 PM",
    currentStop: "Saravanampatti",
    location: { lat: 11.0700, lng: 77.0000, rotation: 45 },
    routeId: {
      routeName: "Coimbatore → Annur",
      from: "Coimbatore",
      to: "Annur",
      path: [
        { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        { lat: 11.0700, lng: 77.0000 }, // Saravanampatti
        { lat: 11.1500, lng: 77.0500 }, // Kovilpalayam
        { lat: 11.2330, lng: 77.1000 }  // Annur
      ],
      stops: [
        { _id: "s14", stopName: "Saravanampatti Signal", lat: 11.0700, lng: 77.0000, type: 'major' },
        { _id: "s15", stopName: "Kovilpalayam Stop", lat: 11.1500, lng: 77.0500, type: 'major' },
        { _id: "s16", stopName: "Annur Bus Stand", lat: 11.2330, lng: 77.1000, type: 'major' }
      ]
    }
  },
  {
    _id: "bus6",
    busNumber: "TN-38-WA-2024",
    busCode: "2024",
    status: "Running",
    speed: 52,
    fare: 1,
    availableSeats: 28,
    departureTime: "08:15 AM",
    arrivalTime: "09:45 AM",
    currentStop: "Ukkadam",
    location: { lat: 11.0168, lng: 76.9639, rotation: 180 },
    routeId: {
      routeName: "Gandhipuram → Walayar",
      from: "Gandhipuram",
      to: "Walayar",
      path: [
        { lat: 11.0168, lng: 76.9639 }, { lat: 11.0084, lng: 76.9698 }, { lat: 11.0065, lng: 76.9723 },
        { lat: 11.0051, lng: 76.9744 }, { lat: 11.0040, lng: 76.9748 }, { lat: 11.0022, lng: 76.9734 },
        { lat: 10.9997, lng: 76.9680 }, { lat: 10.9975, lng: 76.9650 }, { lat: 10.9940, lng: 76.9585 },
        { lat: 10.9877, lng: 76.9616 }, { lat: 10.9780, lng: 76.9660 }, { lat: 10.9720, lng: 76.9665 },
        { lat: 10.9631, lng: 76.9575 }, { lat: 10.9576, lng: 76.9538 }, { lat: 10.9500, lng: 76.9480 },
        { lat: 10.9450, lng: 76.9450 }, { lat: 10.9380, lng: 76.9420 }, { lat: 10.9300, lng: 76.9380 },
        { lat: 10.9250, lng: 76.9350 }, { lat: 10.9210, lng: 76.9325 }, { lat: 10.9160, lng: 76.9295 },
        { lat: 10.9080, lng: 76.9250 }, { lat: 10.9050, lng: 76.9230 }, { lat: 10.8980, lng: 76.9180 },
        { lat: 10.8930, lng: 76.9150 }, { lat: 10.8880, lng: 76.9120 }, { lat: 10.8750, lng: 76.9050 },
        { lat: 10.8550, lng: 76.8850 }, { lat: 10.8400, lng: 76.8700 }, { lat: 10.8250, lng: 76.8500 }
      ],
      stops: [
        { _id: "gw1", stopName: "Gandhipuram Town Bus Stand", lat: 11.0168, lng: 76.9639, type: 'major' },
        { _id: "gw2", stopName: "Womens Polytechnic", lat: 11.0084, lng: 76.9698, type: 'small' },
        { _id: "gw3", stopName: "R.T.O", lat: 11.0065, lng: 76.9723, type: 'small' },
        { _id: "gw4", stopName: "Stanes School", lat: 11.0051, lng: 76.9744, type: 'small' },
        { _id: "gw5", stopName: "Anna Statue", lat: 11.0040, lng: 76.9748, type: 'small' },
        { _id: "gw6", stopName: "D.S.P Office", lat: 11.0022, lng: 76.9734, type: 'small' },
        { _id: "gw7", stopName: "Collector Office", lat: 10.9997, lng: 76.9680, type: 'small' },
        { _id: "gw8", stopName: "Railway Station", lat: 10.9975, lng: 76.9650, type: 'major' },
        { _id: "gw9", stopName: "Town Hall", lat: 10.9940, lng: 76.9585, type: 'major' },
        { _id: "gw10", stopName: "Ukkadam", lat: 10.9877, lng: 76.9616, type: 'major' },
        { _id: "gw11", stopName: "Karumbukadai", lat: 10.9780, lng: 76.9660, type: 'small' },
        { _id: "gw12", stopName: "Athupalam", lat: 10.9720, lng: 76.9665, type: 'small' },
        { _id: "gw13", stopName: "Kuniyamuthur High School", lat: 10.9631, lng: 76.9575, type: 'small' },
        { _id: "gw14", stopName: "Kuniyamuthur", lat: 10.9576, lng: 76.9538, type: 'major' },
        { _id: "gw15", stopName: "Nehru College", lat: 10.9500, lng: 76.9480, type: 'small' },
        { _id: "gw16", stopName: "Edayarpalayam Pirivu", lat: 10.9450, lng: 76.9450, type: 'small' },
        { _id: "gw17", stopName: "Kuniyamuthur Police Station", lat: 10.9380, lng: 76.9420, type: 'small' },
        { _id: "gw18", stopName: "B.K. Pudur", lat: 10.9300, lng: 76.9380, type: 'small' },
        { _id: "gw19", stopName: "Kovaipudur Pirivu", lat: 10.9250, lng: 76.9350, type: 'small' },
        { _id: "gw20", stopName: "Milekal", lat: 10.9210, lng: 76.9325, type: 'small' },
        { _id: "gw21", stopName: "Gandhi Nagar", lat: 10.9160, lng: 76.9295, type: 'small' },
        { _id: "gw22", stopName: "Madukkarai Police Station", lat: 10.9080, lng: 76.9250, type: 'major' },
        { _id: "gw23", stopName: "Madukkarai Union Office", lat: 10.9050, lng: 76.9230, type: 'small' },
        { _id: "gw24", stopName: "Marappalam", lat: 10.8980, lng: 76.9180, type: 'small' },
        { _id: "gw25", stopName: "Chettipalayam Pirivu", lat: 10.8930, lng: 76.9150, type: 'small' },
        { _id: "gw26", stopName: "Indian Bank", lat: 10.8880, lng: 76.9120, type: 'small' },
        { _id: "gw27", stopName: "Thirumalayampalayam Pirivu", lat: 10.8750, lng: 76.9050, type: 'small' },
        { _id: "gw28", stopName: "K.G. Chavadi", lat: 10.8550, lng: 76.8850, type: 'major' },
        { _id: "gw29", stopName: "Aallamara", lat: 10.8400, lng: 76.8700, type: 'small' },
        { _id: "gw30", stopName: "Walayar (Last Stop)", lat: 10.8250, lng: 76.8500, type: 'major' }
      ]
    }
  }
];
