export interface TripDto {
  typeOfTrip: {
    bar: boolean;
    restaurant: boolean;
    museum: boolean;
  };
  radius: number;
}

export interface Place {
  displayName: {
    text: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  primaryType: string;
  rating: string;
}
