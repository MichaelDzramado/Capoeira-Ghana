/* @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorProgressionManager } from "@/components/instructor/progression/instructor-progression-manager";

const studentId =
  "10000000-0000-4000-8000-000000000001";

const cruaBeltId =
  "00000000-0000-4000-8000-000000000101";

const cruaAmarelaBeltId =
  "00000000-0000-4000-8000-000000000102";

const baseDetail = {
  student: {
    studentId,
    firstName: "Kojo",
    lastName: "Mensah",
  },
  progress: {
    id: "00000000-0000-4000-8000-000000000201",
    studentId,
    currentBeltId: cruaBeltId,
    currentBeltName: "Crua",
    currentBeltRank: 1,
    currentBeltDescription:
      "Beginning level in the development pathway.",
    notes: null,
    updatedAt: "2026-04-24T00:00:00.000Z",
  },
  belts: [
    {
      id: cruaBeltId,
      name: "Crua",
      rankOrder: 1,
      description:
        "Beginning level in the development pathway.",
    },
    {
      id: cruaAmarelaBeltId,
      name: "Crua-Amarela",
      rankOrder: 2,
      description: "Early progression level.",
    },
  ],
  history: [
    {
      id: "00000000-0000-0000-0000-000000000301",
      beltId: cruaBeltId,
      beltName: "Crua",
      rankOrder: 1,
      awardedAt: "2026-04-24",
      awardedBy:
        "30000000-0000-4000-8000-000000000001",
      notes: null,
    },
  ],
};

const updatedDetail = {
  ...baseDetail,
  progress: {
    ...baseDetail.progress,
    currentBeltId: cruaAmarelaBeltId,
    currentBeltName: "Crua-Amarela",
    currentBeltRank: 2,
    currentBeltDescription:
      "Early progression level.",
    notes: "Strong improvement during intensive training.",
    updatedAt: "2026-09-28T10:54:45.870Z",
  },
  history: [
    {
      id: "00000000-0000-0000-0000-000000000302",
      beltId: cruaAmarelaBeltId,
      beltName: "Crua-Amarela",
      rankOrder: 2,
      awardedAt: "2026-09-28",
      awardedBy:
        "30000000-0000-4000-8000-000000000001",
      notes:
        "Strong improvement during intensive training.",
    },
    ...baseDetail.history,
  ],
};

function createFetchMock() {
  return vi.fn(
    async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const url = String(input);

      if (
        url ===
        "/api/instructor/progression/students"
      ) {
        return new Response(
          JSON.stringify({
            data: [
              {
                studentId,
                firstName: "Kojo",
                lastName: "Mensah",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (
        url ===
        `/api/instructor/progression/students/${studentId}`
      ) {
        if (init?.method === "PATCH") {
          return new Response(
            JSON.stringify({
              data: updatedDetail,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        return new Response(
          JSON.stringify({
            data: baseDetail,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          error: "Not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    },
  );
}

describe("InstructorProgressionManager", () => {
  let fetchMock: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads students and displays progression details", async () => {
    render(<InstructorProgressionManager />);

    expect(
      await screen.findByText("Kojo Mensah"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Belt History"),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Award New Belt",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Belt History"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Belt History",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Crua",
      }),
    ).toBeInTheDocument();
  });

  it("keeps Award Belt disabled while the current belt is selected", async () => {
    render(<InstructorProgressionManager />);

    await screen.findByLabelText("New belt");

    const awardButton =
      screen.getByRole("button", {
        name: "Award Belt",
      });

    expect(awardButton).toBeDisabled();
  });

  it("updates progression with the selected belt and note", async () => {
    const user = userEvent.setup();

    render(<InstructorProgressionManager />);

    await screen.findByLabelText("New belt");

    const beltSelect =
      screen.getByLabelText("New belt");

    await user.selectOptions(
      beltSelect,
      cruaAmarelaBeltId,
    );

    const note =
      screen.getByLabelText(
        /Progression note/i,
      );

    await user.clear(note);

    await user.type(
      note,
      "Strong improvement during intensive training.",
    );

    const awardButton =
      screen.getByRole("button", {
        name: "Award Belt",
      });

    expect(awardButton).toBeEnabled();

    await user.click(awardButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Student progression updated successfully.",
        ),
      ).toBeInTheDocument();
    });

    expect(beltSelect).toHaveValue(
      cruaAmarelaBeltId,
    );

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent(
      "Student progression updated successfully.",
    );

    const patchCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input).includes(
          `/api/instructor/progression/students/${studentId}`,
        ) &&
        init?.method === "PATCH",
    );

    expect(patchCall).toBeDefined();

    const patchBody = JSON.parse(
      String(patchCall?.[1]?.body),
    );

    expect(patchBody).toEqual({
      beltId: cruaAmarelaBeltId,
      notes:
        "Strong improvement during intensive training.",
    });
  });

  it("displays an API error when students cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error:
              "Unable to load progression students.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    render(<InstructorProgressionManager />);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to load progression students.",
    );
  });
});
