export interface generatorParams {
  typeOfTrip: {
    restaurant: boolean | null | undefined;
    museum: boolean | null | undefined;
    art_gallery: boolean | null | undefined;
    park: boolean | null | undefined;
    amusement_park: boolean | null | undefined;
    night_club: boolean | null | undefined;
    tourist_attraction: boolean | null | undefined;
  };
  radius: number | null;
  rating: number | null;
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
