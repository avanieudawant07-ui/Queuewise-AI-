import { z } from "zod";
import { Waitlist } from "../models/Waitlist.js";
import { Patient } from "../models/Patient.js";
import { getEligibleCandidates, createOfferService } from "../services/waitlist.js";
import { registerTool } from "./registry.js";

export const getWaitlistTool = {
  name: "get_waitlist",
  description: "Get ranked waitlist candidates matching clinic and slot criteria",
  schema: z.object({
    clinicId: z.string(),
    doctorId: z.string().optional(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string()
  }),
  execute: async (params) => {
    const candidates = await getEligibleCandidates(params);
    return candidates.map(c => c.toObject());
  }
};
registerTool(getWaitlistTool);

export const getPatientPreferencesTool = {
  name: "get_patient_preferences",
  description: "Get time preferences and contact details of a patient",
  schema: z.object({
    patientId: z.string()
  }),
  execute: async ({ patientId }) => {
    const p = await Patient.findById(patientId);
    return p ? p.toObject() : null;
  }
};
registerTool(getPatientPreferencesTool);

export const createWaitlistOfferTool = {
  name: "create_waitlist_offer",
  description: "Create and send a time-limited slot offer to a waitlisted patient",
  schema: z.object({
    waitlistId: z.string(),
    slot: z.object({
      doctorId: z.string(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string()
    }),
    message: z.string(),
    ttlMinutes: z.number().default(60)
  }),
  execute: async (params) => {
    const offer = await createOfferService(params);
    return offer.toObject();
  }
};
registerTool(createWaitlistOfferTool);

export const updateWaitlistEntryTool = {
  name: "update_waitlist_entry",
  description: "Update waitlist status or priority score",
  schema: z.object({
    waitlistId: z.string(),
    status: z.enum(["active", "offered", "fulfilled", "cancelled", "expired"]).optional(),
    priorityScore: z.number().optional()
  }),
  execute: async ({ waitlistId, ...updates }) => {
    const entry = await Waitlist.findByIdAndUpdate(waitlistId, updates, { new: true });
    return entry ? entry.toObject() : null;
  }
};
registerTool(updateWaitlistEntryTool);
