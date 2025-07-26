-- CreateEnum
CREATE TYPE "ConsensusStatus" AS ENUM ('PENDING', 'IN_CONSENSUS', 'CONSENSED');

-- CreateEnum
CREATE TYPE "ConsensusVoteType" AS ENUM ('A_FAVOR', 'EN_CONTRA', 'OBJETAR', 'ABSTENERSE');

-- CreateEnum
CREATE TYPE "ObjectionStatus" AS ENUM ('PENDIENTE', 'VALIDA', 'INVALIDA');

-- CreateEnum
CREATE TYPE "VotingRoundStatus" AS ENUM ('ACTIVA', 'CERRADA', 'CONSENSADA');

-- AlterTable
ALTER TABLE "QuarterlyReport" ADD COLUMN     "consensusStatus" "ConsensusStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ConsensusVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "voteType" "ConsensusVoteType" NOT NULL,
    "comment" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsensusVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsensusComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "content" TEXT NOT NULL,
    "likes" TEXT[],
    "dislikes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsensusComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objection" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "status" "ObjectionStatus" NOT NULL DEFAULT 'PENDIENTE',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingRound" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "status" "VotingRoundStatus" NOT NULL DEFAULT 'ACTIVA',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "VotingRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsensusVote_reportId_idx" ON "ConsensusVote"("reportId");

-- CreateIndex
CREATE INDEX "ConsensusVote_roundId_idx" ON "ConsensusVote"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsensusVote_userId_roundId_key" ON "ConsensusVote"("userId", "roundId");

-- CreateIndex
CREATE INDEX "ConsensusComment_reportId_idx" ON "ConsensusComment"("reportId");

-- CreateIndex
CREATE INDEX "ConsensusComment_parentCommentId_idx" ON "ConsensusComment"("parentCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "Objection_voteId_key" ON "Objection"("voteId");

-- CreateIndex
CREATE INDEX "Objection_status_idx" ON "Objection"("status");

-- CreateIndex
CREATE INDEX "VotingRound_reportId_idx" ON "VotingRound"("reportId");

-- CreateIndex
CREATE INDEX "VotingRound_status_idx" ON "VotingRound"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VotingRound_reportId_roundNumber_key" ON "VotingRound"("reportId", "roundNumber");

-- AddForeignKey
ALTER TABLE "ConsensusVote" ADD CONSTRAINT "ConsensusVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusVote" ADD CONSTRAINT "ConsensusVote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuarterlyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusVote" ADD CONSTRAINT "ConsensusVote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "VotingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusComment" ADD CONSTRAINT "ConsensusComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusComment" ADD CONSTRAINT "ConsensusComment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuarterlyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusComment" ADD CONSTRAINT "ConsensusComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "ConsensusComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objection" ADD CONSTRAINT "Objection_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "ConsensusVote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objection" ADD CONSTRAINT "Objection_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingRound" ADD CONSTRAINT "VotingRound_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuarterlyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
