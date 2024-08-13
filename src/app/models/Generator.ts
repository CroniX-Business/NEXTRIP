export interface generatorParams {
  typeOfTrip: {
    bar: boolean | null | undefined;
    restaurant: boolean  | null | undefined;
    museum: boolean | null | undefined;
  };
}

export interface Place {
  displayName: {
    text: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  primaryType: string;
  rating: string;
}