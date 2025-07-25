-- AddForeignKey
ALTER TABLE "WorkGroupJoinRequest" ADD CONSTRAINT "WorkGroupJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
