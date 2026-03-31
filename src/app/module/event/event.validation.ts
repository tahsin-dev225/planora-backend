// model Event {
//   id          String   @id @default(uuid())
//   title       String
//   description String
//   date        DateTime
//   time        String
//   venue       String

//   type   EventType // PUBLIC / PRIVATE
//   fee    Float // 0 = free
//   isPaid Boolean

//   organizerId String
//   organizer   User   @relation("OrganizerEvents", fields: [organizerId], references: [id])

//   participants Participant[]
//   reviews      Review[]
//   payments     Payment[]

//   createdAt DateTime @default(now())
// }

import { z } from "zod";

const createEventZodValidation = z.object({
  title: z.string("Title Must be string").min(3, "Title must be at least 3 characters long").max(100, "Title must be at most 100 characters long"),
  description: z.string("Description Must be string").min(10, "Description must be at least 10 characters long").max(1000, "Description must be at most 1000 characters long"),
  date: z.string("Date Must be string"),
  time: z.string("Time Must be string"),
  venue: z.string("Venue Must be string"),
  type: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.number(),
  isPaid: z.boolean()
})

const makeFeaturedZodValidation = z.object({
  id: z.string("Id Must be string"),
})

export const eventValidation = {
  createEventZodValidation,
  makeFeaturedZodValidation
}