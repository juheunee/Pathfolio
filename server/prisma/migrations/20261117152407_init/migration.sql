-- CreateEnum
CREATE TYPE "MajorCategory" AS ENUM ('MAJOR_BASIC', 'MAJOR_REQUIRED', 'MAJOR_ELECTIVE');

-- CreateEnum
CREATE TYPE "Term" AS ENUM ('FIRST', 'SUMMER', 'SECOND', 'WINTER');

-- CreateEnum
CREATE TYPE "RecordCategory" AS ENUM ('MAJOR_BASIC', 'MAJOR_REQUIRED', 'MAJOR_ELECTIVE', 'LIBERAL_REQUIRED', 'LIBERAL_DISTRIBUTION', 'LIBERAL_GENERAL', 'GENERAL_ELECTIVE');

-- CreateEnum
CREATE TYPE "RoadmapItemKind" AS ENUM ('COURSE', 'EXTRACURRICULAR');

-- CreateEnum
CREATE TYPE "RoadmapItemStatus" AS ENUM ('PLANNED', 'DONE');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "loginId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "entryYear" INTEGER NOT NULL,
    "currentYear" INTEGER NOT NULL,
    "currentSemester" INTEGER NOT NULL,
    "primaryTrackId" INTEGER,
    "secondaryTrackId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "liberalArea" TEXT,
    "summary" TEXT,
    "profileUrl" TEXT,
    "syllabusUrl" TEXT,
    "sourceUrl" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePrerequisite" (
    "courseId" INTEGER NOT NULL,
    "prerequisiteId" INTEGER NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("courseId","prerequisiteId")
);

-- CreateTable
CREATE TABLE "TrackCourseRule" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "category" "MajorCategory" NOT NULL,
    "catalogYear" INTEGER NOT NULL,
    "recommendedYear" INTEGER,
    "recommendedSemester" INTEGER,
    "sourceUrl" TEXT,
    "note" TEXT,

    CONSTRAINT "TrackCourseRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationRequirement" (
    "id" SERIAL NOT NULL,
    "entryYearFrom" INTEGER NOT NULL,
    "entryYearTo" INTEGER,
    "rules" JSONB NOT NULL,
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isSample" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GraduationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicRecord" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "takenYear" INTEGER NOT NULL,
    "term" "Term" NOT NULL,
    "earnedCredits" INTEGER NOT NULL,
    "category" "RecordCategory" NOT NULL,
    "trackId" INTEGER,
    "grade" TEXT,

    CONSTRAINT "AcademicRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "aiExplanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" SERIAL NOT NULL,
    "roadmapId" INTEGER NOT NULL,
    "kind" "RoadmapItemKind" NOT NULL,
    "courseId" INTEGER,
    "programId" INTEGER,
    "customTitle" TEXT,
    "plannedYear" INTEGER NOT NULL,
    "plannedSemester" INTEGER NOT NULL,
    "status" "RoadmapItemStatus" NOT NULL DEFAULT 'PLANNED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtracurricularCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExtracurricularCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtracurricularProgram" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "applyStart" TIMESTAMP(3),
    "applyEnd" TIMESTAMP(3),
    "runStart" TIMESTAMP(3),
    "runEnd" TIMESTAMP(3),
    "points" INTEGER,
    "sourceUrl" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtracurricularProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorySubscription" (
    "accountId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategorySubscription_pkey" PRIMARY KEY ("accountId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_loginId_key" ON "Account"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_code_key" ON "Track"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrackCourseRule_trackId_courseId_catalogYear_key" ON "TrackCourseRule"("trackId", "courseId", "catalogYear");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicRecord_accountId_courseId_takenYear_term_key" ON "AcademicRecord"("accountId", "courseId", "takenYear", "term");

-- CreateIndex
CREATE UNIQUE INDEX "ExtracurricularCategory_name_key" ON "ExtracurricularCategory"("name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_primaryTrackId_fkey" FOREIGN KEY ("primaryTrackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_secondaryTrackId_fkey" FOREIGN KEY ("secondaryTrackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCourseRule" ADD CONSTRAINT "TrackCourseRule_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCourseRule" ADD CONSTRAINT "TrackCourseRule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ExtracurricularProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtracurricularProgram" ADD CONSTRAINT "ExtracurricularProgram_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExtracurricularCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySubscription" ADD CONSTRAINT "CategorySubscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySubscription" ADD CONSTRAINT "CategorySubscription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExtracurricularCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
