import {
  createTrialBooking,
  type CreateTrialBookingInput,
} from "./data-access";
import { createTrialBookingSchema } from "./schemas";

export async function submitTrialBooking(
  input: CreateTrialBookingInput,
) {
  const validated = createTrialBookingSchema.parse(input);

  return createTrialBooking(validated);
}
