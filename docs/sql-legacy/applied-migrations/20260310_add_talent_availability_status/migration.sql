-- Add player availability status to talent profiles
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'OPEN_TO_OFFERS', 'NOT_AVAILABLE');

ALTER TABLE "talent_profiles"
ADD COLUMN "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'OPEN_TO_OFFERS',
ADD COLUMN "availableFrom" TIMESTAMP(3),
ADD COLUMN "availabilityUpdatedAt" TIMESTAMP(3);
