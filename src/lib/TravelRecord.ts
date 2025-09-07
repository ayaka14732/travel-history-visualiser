export default interface TravelRecord {
  start: number;
  end: number;
  name: string;
  details?:
    | {
        start: number;
        end: number;
        name: string;
      }[];
}
