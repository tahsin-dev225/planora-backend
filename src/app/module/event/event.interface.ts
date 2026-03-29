// model Event {
//   id          String   @id @default(uuid())
//   title       String
//   description String
//   date        DateTime
//   time        String
//   venue       String
//   banner      String

import { EventType } from "../../../generated/prisma/enums";


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


export interface ICreateEvent {
  title: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  banner: string;
  type: EventType;
  fee: number;
  isPaid: boolean;
}

export interface IUserUpdateEvent {
  title: string;
  description: string;

}

export interface IAdminUpdateEvent {
  type: EventType;

}


export interface IQuery {
  search?: string;
  type?: "PUBLIC" | "PRIVATE";
  isPaid?: string;
  upcoming?: string;
  page?: string;
  limit?: string;
}