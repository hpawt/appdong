// src/lib/server/db/schema.js
import { pgTable, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// 1. (핵심) 모든 Enum 타입들을 테이블 정의 바깥에서 먼저 생성합니다.
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const githubExperienceEnum = pgEnum('github_experience', ['유', '무']);

// =================== user 테이블 ===================
export const user = pgTable('user', {
	id: varchar('id', { length: 255 }).primaryKey(),
	username: varchar('username', { length: 255 }).notNull().unique(),
	hashed_password: varchar('hashed_password', { length: 255 }).notNull(),
	student_id: varchar('student_id', { length: 10 }).notNull().unique(),
	department: varchar('department', { length: 255 }).notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	phone_number: varchar('phone_number', { length: 11 }).notNull().unique(),
	// 미리 정의한 roleEnum을 참조합니다.
	role: roleEnum('role').default('USER').notNull()
});

// =================== session 테이블 ===================
export const session = pgTable('session', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 }).references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull()
});

// =================== application 테이블 ===================
export const application = pgTable('application', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 }).references(() => user.id, { onDelete: 'cascade' }),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	phoneNumber: varchar('phone_number', { length: 11 }).notNull(),
	university: varchar('university', { length: 255 }).notNull(),
	department: varchar('department', { length: 255 }).notNull(),
	studentId: varchar('student_id', { length: 20 }).notNull(),
	motivation: text('motivation').notNull(),
	programmingExperience: varchar('programming_experience', { length: 50 }).notNull(),

	// 2. (핵심) 미리 정의한 githubExperienceEnum을 참조하고, .notNull()은 여기에 붙입니다.
	githubExperience: githubExperienceEnum('github_experience').notNull(),

	activityChoice: varchar('activity_choice', { length: 255 }).notNull(),
	vibeServiceIdea: text('vibe_service_idea'),
	studySubjects: text('study_subjects'),
	bootcampProjectIdea: text('bootcamp_project_idea'),
	bootcampMemberLangs: text('bootcamp_member_langs'),
	bootcampMemberLangsOther: varchar('bootcamp_member_langs_other', { length: 255 }),
	bootcampMentorLangs: text('bootcamp_mentor_langs'),
	bootcampMentorLangsOther: varchar('bootcamp_mentor_langs_other', { length: 255 }),
	mentorAvailableTime: text('mentor_available_time'),
	mentorExperience: text('mentor_experience'),
	knownFields: text('known_fields'),
	specificExperience: text('specific_experience'),
	finalWords: text('final_words'),
	submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow()
});

// =================== announcement 테이블 ===================
export const announcement = pgTable('announcement', {
	id: varchar('id', { length: 255 }).primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content').notNull(),
	authorId: varchar('author_id', { length: 255 }).references(() => user.id, {
		onDelete: 'set null'
	}),
	authorName: varchar('author_name', { length: 255 }).notNull(),
	attachments: text('attachments'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
