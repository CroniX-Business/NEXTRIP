import { Types } from 'mongoose';

export interface TripDto {
  typeOfTrip: {
    bar: boolean | null | undefined;
    restaurant: boolean | null | undefined;
    museum: boolean | null | undefined;
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
  websiteUri?: string;
  googleMapsUri: string;
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
  tripId: Types.ObjectId;
  tripName: string;
  places: Place[];
  comment: string;
  public: boolean;
  likes: number;
  timeSaved: Date;
}
