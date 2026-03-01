import { z } from "zod";

export const createTeamInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});
