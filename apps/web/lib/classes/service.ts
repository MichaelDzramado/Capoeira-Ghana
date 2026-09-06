import { getActiveClasses } from "./data-access";
import {
  classesResponseSchema,
  type Class,
} from "./schemas";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-GH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export type ScheduleClass = {
  id: string;
  name: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
  program: {
    id: string;
    name: string;
    slug: string;
  } | null;
  location: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    region: string | null;
  } | null;
};

function mapClass(item: Class): ScheduleClass {
  return {
    id: item.id,
    name: item.name,
    dayOfWeek: item.day_of_week,
    dayName: DAY_NAMES[item.day_of_week],
    startTime: formatTime(item.start_time),
    endTime: formatTime(item.end_time),
    capacity: item.capacity,
    program: item.programs,
    location: item.locations,
  };
}

export async function listClasses(): Promise<ScheduleClass[]> {
  const classes = await getActiveClasses();

  const validated = classesResponseSchema.parse(classes);

  return validated.map(mapClass);
}
