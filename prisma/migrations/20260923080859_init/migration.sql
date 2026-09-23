-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "planning_status" AS ENUM ('DRAFT', 'LOCKED');

-- CreateEnum
CREATE TYPE "assignment_source" AS ENUM ('SELF', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birth_date" DATE,
    "role" "user_role" NOT NULL DEFAULT 'VOLUNTEER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "registration_opens_at" TIMESTAMP(3) NOT NULL,
    "registration_closes_at" TIMESTAMP(3) NOT NULL,
    "is_registration_locked" BOOLEAN NOT NULL DEFAULT false,
    "min_slots_per_volunteer" INTEGER NOT NULL DEFAULT 1,
    "max_slots_per_volunteer" INTEGER NOT NULL DEFAULT 3,
    "max_consecutive_slots" INTEGER NOT NULL DEFAULT 2,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "rules_markdown" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "edition_id" TEXT NOT NULL,
    "badge_number" TEXT NOT NULL,
    "photo_path" TEXT,
    "planning_status" "planning_status" NOT NULL DEFAULT 'DRAFT',
    "locked_at" TIMESTAMP(3),
    "is_profile_locked" BOOLEAN NOT NULL DEFAULT false,
    "minor_approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_code" (
    "id" TEXT NOT NULL,
    "edition_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "expires_at" TIMESTAMP(3),
    "used_at" TIMESTAMP(3),
    "used_by_volunteer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitation_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission" (
    "id" TEXT NOT NULL,
    "edition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "position" INTEGER NOT NULL,
    "is_self_bookable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slot" (
    "id" TEXT NOT NULL,
    "edition_id" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "position" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_slot" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "time_slot_id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "mission_slot_id" TEXT NOT NULL,
    "time_slot_id" TEXT NOT NULL,
    "source" "assignment_source" NOT NULL DEFAULT 'SELF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "edition_id" TEXT,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_last_name_first_name_idx" ON "user"("last_name", "first_name");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_id_account_id_key" ON "account"("provider_id", "account_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "edition_slug_key" ON "edition"("slug");

-- CreateIndex
CREATE INDEX "edition_is_archived_idx" ON "edition"("is_archived");

-- CreateIndex
CREATE INDEX "volunteer_edition_id_planning_status_idx" ON "volunteer"("edition_id", "planning_status");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_user_id_edition_id_key" ON "volunteer"("user_id", "edition_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_edition_id_badge_number_key" ON "volunteer"("edition_id", "badge_number");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_code_code_key" ON "invitation_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_code_used_by_volunteer_id_key" ON "invitation_code"("used_by_volunteer_id");

-- CreateIndex
CREATE INDEX "invitation_code_edition_id_used_at_idx" ON "invitation_code"("edition_id", "used_at");

-- CreateIndex
CREATE INDEX "invitation_code_email_idx" ON "invitation_code"("email");

-- CreateIndex
CREATE INDEX "mission_edition_id_position_idx" ON "mission"("edition_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "mission_edition_id_name_key" ON "mission"("edition_id", "name");

-- CreateIndex
CREATE INDEX "time_slot_edition_id_starts_at_idx" ON "time_slot"("edition_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "time_slot_edition_id_event_date_position_key" ON "time_slot"("edition_id", "event_date", "position");

-- CreateIndex
CREATE INDEX "mission_slot_time_slot_id_idx" ON "mission_slot"("time_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_slot_mission_id_time_slot_id_key" ON "mission_slot"("mission_id", "time_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_slot_id_time_slot_id_key" ON "mission_slot"("id", "time_slot_id");

-- CreateIndex
CREATE INDEX "assignment_mission_slot_id_idx" ON "assignment"("mission_slot_id");

-- CreateIndex
CREATE INDEX "assignment_time_slot_id_idx" ON "assignment"("time_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_volunteer_id_time_slot_id_key" ON "assignment"("volunteer_id", "time_slot_id");

-- CreateIndex
CREATE INDEX "audit_log_edition_id_created_at_idx" ON "audit_log"("edition_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_created_at_idx" ON "audit_log"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer" ADD CONSTRAINT "volunteer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer" ADD CONSTRAINT "volunteer_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_code" ADD CONSTRAINT "invitation_code_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_code" ADD CONSTRAINT "invitation_code_used_by_volunteer_id_fkey" FOREIGN KEY ("used_by_volunteer_id") REFERENCES "volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slot" ADD CONSTRAINT "time_slot_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_slot" ADD CONSTRAINT "mission_slot_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_slot" ADD CONSTRAINT "mission_slot_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_mission_slot_id_time_slot_id_fkey" FOREIGN KEY ("mission_slot_id", "time_slot_id") REFERENCES "mission_slot"("id", "time_slot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "edition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
