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
  location?: {
    latitude: number;
    longitude: number;
  };
  primaryType: string;
  rating: number;
}