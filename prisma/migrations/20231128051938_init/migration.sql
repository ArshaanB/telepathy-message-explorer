-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nonce" INTEGER NOT NULL,
    "messageHash" TEXT NOT NULL,
    "messageBytes" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_nonce_key" ON "Message"("nonce");
