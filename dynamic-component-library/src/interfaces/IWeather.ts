export interface IWeather {
  id: number;
  isDefault: boolean;
  lastUpdated: string; // or Date if you plan to parse it into a Date object
  name: string;
}