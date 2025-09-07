import TravelRecord from "./TravelRecord";
import { dateStrToNum } from "./dateUtils";

const csvInputToJson = (data: string): TravelRecord[] => {
  const rows = data.split("\n").map(r => r.split(/\t/).map(c => c.trim()));
  const trips: TravelRecord[] = [];
  let currentTrip: TravelRecord | null = null;

  for (const row of rows) {
    const [start, end, name, subName, subStart, subEnd] = row;

    if (start && end && name) {
      // new top-level trip
      if (subName) {
        // parent with first detail inline
        currentTrip = {
          start: dateStrToNum(start),
          end: dateStrToNum(end),
          name,
          details: [
            {
              start: dateStrToNum(subStart || start),
              end: dateStrToNum(subEnd || end),
              name: subName,
            },
          ],
        };
      } else {
        currentTrip = {
          start: dateStrToNum(start),
          end: dateStrToNum(end),
          name,
        };
      }
      trips.push(currentTrip);
    } else if (currentTrip && subName) {
      // continuation of current trip's details
      currentTrip.details = currentTrip.details || [];
      currentTrip.details.push({
        start: dateStrToNum(subStart),
        end: dateStrToNum(subEnd),
        name: subName,
      });
    }
  }
  return trips;
};

export default csvInputToJson;
