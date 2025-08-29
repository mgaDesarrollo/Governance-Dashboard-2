-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "dislikes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "likes" TEXT[] DEFAULT ARRAY[]::TEXT[];
