import { createClient } from "@/lib/supabase/server";

export type CreateTrialBookingInput = {
  studentName: string;
  email: string;
  phone?: string;
  age?: number;
  programId?: string;
  classId?: string;
  preferredDate?: string;
  message?: string;
};

export async function createTrialBooking(
  input: CreateTrialBookingInput,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trial_bookings")
    .insert({
      student_name: input.studentName,
      email: input.email,
      phone: input.phone || null,
      age: input.age ?? null,
      program_id: input.programId || null,
      class_id: input.classId || null,
      preferred_date: input.preferredDate || null,
      message: input.message || null,
    });

  if (error) {
    throw new Error(`Failed to create trial booking: ${error.message}`);
  }

  return {
    submitted: true,
  };
}
