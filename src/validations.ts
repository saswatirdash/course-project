import { z } from "zod";
import { BtechYear, CertStatus, InternshipStatus } from "./types";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  btechYear: z.nativeEnum(BtechYear),
  branch: z.string().min(2, "Branch must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const dailyTargetSchema = z.object({
  hours: z.number().min(0).max(16),
});

export const studyLogSchema = z.object({
  hours: z.number().min(0).max(16),
});

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
});

export const chapterSchema = z.object({
  name: z.string().min(2, "Chapter name must be at least 2 characters"),
});

export const semesterSchema = z.object({
  number: z.number().min(1).max(8),
});

export const subjectGradeSchema = z.object({
  subjectName: z.string().min(2, "Subject name must be at least 2 characters"),
  credits: z.number().min(1).max(6),
  grade: z.string().optional(),
  gradePoint: z.number().min(0).max(10).optional(),
});

export const certificationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  provider: z.string().min(2, "Provider must be at least 2 characters"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const internshipSchema = z.object({
  company: z.string().min(2, "Company must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  type: z.string().min(2, "Type must be at least 2 characters"),
  startDate: z.string().optional(),
  stipend: z.number().optional(),
});
