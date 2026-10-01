export const initialSeedData = {
  clinic: {
    name: "Metro Health Medical Center",
    address: "100 Innovation Way, Suite 400, Mumbai, Maharashtra",
    phone: "9821001999",
    timezone: "Asia/Kolkata",
    workingHours: { start: "08:00", end: "17:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
  },
  doctors: [
    {
      name: "Dr. Sarah Jenkins",
      specialty: "General Physician & Internal Medicine",
      phone: "9821001201",
      slotDurationMinutes: 30,
      workingHours: { start: "09:00", end: "17:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    },
    {
      name: "Dr. Marcus Vance",
      specialty: "Cardiology Specialist",
      phone: "9821001202",
      slotDurationMinutes: 45,
      workingHours: { start: "09:00", end: "16:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    },
    {
      name: "Dr. Emily Chen",
      specialty: "ENT Specialist (Ear, Nose & Throat)",
      phone: "9821001203",
      slotDurationMinutes: 30,
      workingHours: { start: "09:00", end: "17:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    },
    {
      name: "Dr. Robert Patel",
      specialty: "Orthopedic & Joint Specialist",
      phone: "9821001204",
      slotDurationMinutes: 45,
      workingHours: { start: "08:30", end: "16:30", days: ["Monday", "Wednesday", "Friday"] }
    },
    {
      name: "Dr. Sophia Rodriguez",
      specialty: "Dermatologist & Skin Care",
      phone: "9821001205",
      slotDurationMinutes: 30,
      workingHours: { start: "09:00", end: "17:00", days: ["Tuesday", "Thursday", "Friday"] }
    },
    {
      name: "Dr. Michael Chang",
      specialty: "Pediatrician (Child Healthcare)",
      phone: "9821001206",
      slotDurationMinutes: 30,
      workingHours: { start: "08:30", end: "16:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    },
    {
      name: "Dr. Olivia Taylor",
      specialty: "Neurologist & Brain Health",
      phone: "9821001207",
      slotDurationMinutes: 45,
      workingHours: { start: "09:00", end: "15:30", days: ["Monday", "Wednesday", "Thursday"] }
    }
  ],
  patients: [
    {
      name: "Alex Rivera",
      phone: "9876543210",
      preferredContactMethod: "SMS",
      timePreferences: { days: ["Monday", "Wednesday", "Friday"], timeOfDay: ["Morning"] }
    },
    {
      name: "Elena Rostova",
      phone: "9876543211",
      preferredContactMethod: "SMS",
      timePreferences: { days: ["Tuesday", "Thursday"], timeOfDay: ["Morning", "Afternoon"] }
    },
    {
      name: "David Chen",
      phone: "9876543212",
      preferredContactMethod: "SMS",
      timePreferences: { days: ["Monday", "Tuesday", "Wednesday"], timeOfDay: ["Afternoon"] }
    },
    {
      name: "Sophia Martinez",
      phone: "9876543213",
      preferredContactMethod: "SMS",
      timePreferences: { days: ["Friday"], timeOfDay: ["Morning"] }
    }
  ]
};
