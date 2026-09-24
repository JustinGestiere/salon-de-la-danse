import { z } from "zod";

import { REMINDER_CAMPAIGNS } from "@/features/notifications/constants";

export const reminderCampaignSchema = z.object({
  campaign: z.enum(REMINDER_CAMPAIGNS),
});
