CREATE TABLE "WaitlistMember" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "position" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WaitlistMember_email_key" ON "WaitlistMember"("email");
CREATE UNIQUE INDEX "WaitlistMember_position_key" ON "WaitlistMember"("position");
