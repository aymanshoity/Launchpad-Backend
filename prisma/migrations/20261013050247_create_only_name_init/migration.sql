-- DropIndex
DROP INDEX "sessions_user_agent_key";

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "revoked_at" DROP NOT NULL,
ALTER COLUMN "revoked_at" DROP DEFAULT;
