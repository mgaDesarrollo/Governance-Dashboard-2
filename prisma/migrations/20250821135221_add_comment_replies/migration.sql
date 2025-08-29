-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
