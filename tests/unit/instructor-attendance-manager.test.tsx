// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { InstructorAttendanceManager } from "@/components/instructor/attendance/instructor-attendance-manager";

const sessionId =
  "50000000-0000-4000-8000-000000000001";

const studentId =
  "10000000-0000-4000-8000-000000000001";

const session = {
  id: sessionId,
  classId:
    "40000000-0000-4000-8000-000000000002",
  className: "Tuesday Fundamentals",
  sessionDate: "2026-09-01",
  startTime: "18:00:00",
  endTime: "19:15:00",
};

const roster = {
  session,
  students: [
    {
      studentId,
      firstName: "Kojo",
      lastName: "Mensah",
      status: null,
      notes: null,
    },
  ],
};

describe("InstructorAttendanceManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads sessions and the selected roster", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [session],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: roster,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    render(<InstructorAttendanceManager />);

    expect(
      await screen.findByText("Kojo Mensah"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Tuesday Fundamentals"),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/instructor/attendance/sessions",
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/api/instructor/attendance/sessions/${sessionId}`,
    );
  });

  it("allows an instructor to select attendance status", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [session],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: roster,
          }),
          { status: 200 },
        ),
      );

    render(<InstructorAttendanceManager />);

    const presentButton =
      await screen.findByRole("button", {
        name: "Present",
      });

    fireEvent.click(presentButton);

    expect(presentButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("saves the complete attendance roster", async () => {
    const updatedRoster = {
      ...roster,
      students: [
        {
          ...roster.students[0],
          status: "late" as const,
          notes: "Arrived 10 minutes late",
        },
      ],
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [session],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: roster,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message:
              "Attendance saved successfully.",
            data: updatedRoster,
          }),
          { status: 200 },
        ),
      );

    render(<InstructorAttendanceManager />);

    const lateButton =
      await screen.findByRole("button", {
        name: "Late",
      });

    fireEvent.click(lateButton);

    const notesInput =
      screen.getByLabelText("Notes (optional)");

    fireEvent.change(notesInput, {
      target: {
        value: "Arrived 10 minutes late",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save Attendance",
      }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `/api/instructor/attendance/sessions/${sessionId}`,
      expect.objectContaining({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const patchRequest =
      fetchMock.mock.calls[2][1];

    expect(
      JSON.parse(
        String(patchRequest?.body),
      ),
    ).toEqual({
      attendance: [
        {
          studentId,
          status: "late",
          notes: "Arrived 10 minutes late",
        },
      ],
    });

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent(
      "Attendance saved successfully.",
    );
  });

  it("shows an API error when saving fails", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [session],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: roster,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error:
              "Unable to save attendance.",
          }),
          { status: 500 },
        ),
      );

    render(<InstructorAttendanceManager />);

    await screen.findByText("Kojo Mensah");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Present",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save Attendance",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to save attendance.",
    );
  });
});
