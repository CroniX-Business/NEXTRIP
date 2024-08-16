export interface generatorParams {
  typeOfTrip: {
    bar: boolean | null | undefined;
    restaurant: boolean  | null | undefined;
    museum: boolean | null | undefined;
  };
  radius: number;
}

export interface Place {
  displayName: {
    text: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  primaryType: string;
  rating: number;
  currentOpeningHours?: {
    openNow: boolean;
    periods: {
      open: {
        day: number;
        time: string;
      };
      close?: {
        day: number;
        time: string;
      };
    }[];
    weekdayDescriptions?: string[];
  };
  photos?: {
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions?: {
      displayName: string;
      uri: string;
    }[];
  }[];
}

export interface Trip {
  tripId: string;
  tripName: string;
  places: Place[];
  timeSaved: Date;
}