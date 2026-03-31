// model Participant {
//   id String @id @default(uuid())

import { ParticipantStatus } from "../../../generated/prisma/enums";

//   userId  String
//   eventId String

//   status ParticipantStatus @default(PENDING)

//   user  User  @relation(fields: [userId], references: [id])
//   event Event @relation(fields: [eventId], references: [id])

//   payment Payment? @relation("ParticipantPayment")

//   createdAt DateTime @default(now())
//    @@unique([userId, eventId])
// }

export interface IUpdateParticipant {
  participantId: string;
  status: ParticipantStatus;
}
