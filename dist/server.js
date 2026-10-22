var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";

// src/utils/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
  statusCode;
  message;
};

// src/middleware/errorHandler.ts
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

// generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: \`npx create-db\`

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  member
  reviewer
  admin

  @@map("user_role")
}

enum UserStatus {
  active
  suspended
  deleted

  @@map("user_status")
}

enum AuthProvider {
  email
  google

  @@map("auth_provider")
}

enum TokenPurpose {
  verify_email
  reset_password

  @@map("token_purpose")
}

enum StaffActions {
  suspend_user
  unsuspend_user
  change_role
  approve_product
  reject_product
  request_product_changes
  takedown_product
  feature_product
  resolve_report

  @@map("staff_action")
}

model User {
  id String @id @default(uuid()) @db.Uuid

  email           String    @unique @db.Citext
  emailVerifiedAt DateTime? @map("email_verified_at") @db.Timestamptz(6)

  passwordHash      String?   @map("password_hash")
  passwordChangedAt DateTime? @map("password_changed_at") @db.Timestamptz()
  failedAttempts    Int       @default(0) @map("failed_attempts")
  lockedUntil       DateTime? @map("locked_until") @db.Timestamptz()

  headline    String?
  username    String? @db.VarChar(50)
  displayName String? @map("display_name")
  avatarURL   String? @map("avatar_url")

  role   UserRole   @default(member)
  status UserStatus @default(active)

  suspendedAt     DateTime? @map("suspended_at") @db.Timestamptz(6)
  suspendedReason String?   @map("suspended_reason")

  // anti-cheat signals
  signupIp    String?   @map("signup_ip") @db.Inet
  lastLoginIp String?   @map("last_login_ip") @db.Inet
  lastLoginAt DateTime? @map("last_login_at") @db.Timestamptz

  // 
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime  @default(now()) @map("updated_at") @db.Timestamptz(6)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)

  sessions       Session[]
  authTokens     AuthToken[]
  oauthAccounts  OAuthAccount[]
  staffAuditLogs StaffAuditLog[]

  @@index([status])
  @@index([role])
  @@index([signupIp, createdAt(sort: Desc)])
  @@map("users")
}

model OAuthAccount {
  id             String       @id @default(uuid()) @db.Uuid
  userId         String       @map("user_id") @db.Uuid
  provider       AuthProvider
  providerUserId String       @map("provider_user_id")
  email          String       @db.Citext
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([provider, providerUserId])
  @@index([userId])
  @@map("oauth_account")
}

model Session {
  id               String   @id @default(uuid()) @db.Uuid
  userId           String   @map("user_id") @db.Uuid
  refreshTokenHash String   @unique @map("refresh_token_hash")
  userAgent        String   @unique @map("user_agent")
  ip               String?  @map("signup_ip") @db.Inet
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  lastUsedAt       DateTime @default(now()) @map("last_used_at") @db.Timestamptz(6)
  expiresAt        DateTime @default(now()) @map("expires_at") @db.Timestamptz(6)
  revokedAt        DateTime @default(now()) @map("revoked_at") @db.Timestamptz(6)

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model AuthToken {
  id        String       @id @default(uuid()) @db.Uuid
  userId    String       @map("user_id") @db.Uuid
  purpose   TokenPurpose
  tokenHash String       @unique @map("token_hash")
  expiresAt DateTime     @map("expires_at") @db.Timestamptz(6)
  usedAt    DateTime?    @map("used_at") @db.Timestamptz(6)
  createdAt DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  user      User?        @relation(fields: [userId], references: [id])

  @@index([userId, purpose])
  @@index([expiresAt])
  @@map("auth_tokens")
}

model StaffAuditLog {
  id         String       @id @default(uuid()) @db.Uuid
  actorId    String       @map("actor_id") @db.Uuid
  action     StaffActions
  targetType String       @map("target_type") // 'user' | 'product' | 'comment' | 'report'
  targetId   String       @map("target_id") @db.Uuid
  reason     String?
  metadata   Json?        @db.JsonB
  ipAddress  String?      @map("ip_address") @db.Inet
  createdAt  DateTime     @default(now()) @map("created_at") @db.Timestamptz

  actor User @relation(fields: [actorId], references: [id], onDelete: Cascade)

  @@index([actorId, createdAt(sort: Desc)])
  @@index([targetType, targetId, createdAt(sort: Desc)])
  @@map("staff_audit_log")
}
`,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerifiedAt","kind":"scalar","type":"DateTime","dbName":"email_verified_at"},{"name":"passwordHash","kind":"scalar","type":"String","dbName":"password_hash"},{"name":"passwordChangedAt","kind":"scalar","type":"DateTime","dbName":"password_changed_at"},{"name":"failedAttempts","kind":"scalar","type":"Int","dbName":"failed_attempts"},{"name":"lockedUntil","kind":"scalar","type":"DateTime","dbName":"locked_until"},{"name":"headline","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"displayName","kind":"scalar","type":"String","dbName":"display_name"},{"name":"avatarURL","kind":"scalar","type":"String","dbName":"avatar_url"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"suspendedAt","kind":"scalar","type":"DateTime","dbName":"suspended_at"},{"name":"suspendedReason","kind":"scalar","type":"String","dbName":"suspended_reason"},{"name":"signupIp","kind":"scalar","type":"String","dbName":"signup_ip"},{"name":"lastLoginIp","kind":"scalar","type":"String","dbName":"last_login_ip"},{"name":"lastLoginAt","kind":"scalar","type":"DateTime","dbName":"last_login_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"authTokens","kind":"object","type":"AuthToken","relationName":"AuthTokenToUser"},{"name":"oauthAccounts","kind":"object","type":"OAuthAccount","relationName":"OAuthAccountToUser"},{"name":"staffAuditLogs","kind":"object","type":"StaffAuditLog","relationName":"StaffAuditLogToUser"}],"dbName":"users","schema":null},"OAuthAccount":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"provider","kind":"enum","type":"AuthProvider"},{"name":"providerUserId","kind":"scalar","type":"String","dbName":"provider_user_id"},{"name":"email","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"OAuthAccountToUser"}],"dbName":"oauth_account","schema":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"refreshTokenHash","kind":"scalar","type":"String","dbName":"refresh_token_hash"},{"name":"userAgent","kind":"scalar","type":"String","dbName":"user_agent"},{"name":"ip","kind":"scalar","type":"String","dbName":"signup_ip"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"lastUsedAt","kind":"scalar","type":"DateTime","dbName":"last_used_at"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"revokedAt","kind":"scalar","type":"DateTime","dbName":"revoked_at"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"sessions","schema":null},"AuthToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"purpose","kind":"enum","type":"TokenPurpose"},{"name":"tokenHash","kind":"scalar","type":"String","dbName":"token_hash"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"usedAt","kind":"scalar","type":"DateTime","dbName":"used_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"AuthTokenToUser"}],"dbName":"auth_tokens","schema":null},"StaffAuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"actorId","kind":"scalar","type":"String","dbName":"actor_id"},{"name":"action","kind":"enum","type":"StaffActions"},{"name":"targetType","kind":"scalar","type":"String","dbName":"target_type"},{"name":"targetId","kind":"scalar","type":"String","dbName":"target_id"},{"name":"reason","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"ipAddress","kind":"scalar","type":"String","dbName":"ip_address"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"actor","kind":"object","type":"User","relationName":"StaffAuditLogToUser"}],"dbName":"staff_audit_log","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","authTokens","oauthAccounts","actor","staffAuditLogs","_count","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_avg","_sum","_min","_max","User.groupBy","User.aggregate","OAuthAccount.findUnique","OAuthAccount.findUniqueOrThrow","OAuthAccount.findFirst","OAuthAccount.findFirstOrThrow","OAuthAccount.findMany","OAuthAccount.createOne","OAuthAccount.createMany","OAuthAccount.createManyAndReturn","OAuthAccount.updateOne","OAuthAccount.updateMany","OAuthAccount.updateManyAndReturn","OAuthAccount.upsertOne","OAuthAccount.deleteOne","OAuthAccount.deleteMany","OAuthAccount.groupBy","OAuthAccount.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","AuthToken.findUnique","AuthToken.findUniqueOrThrow","AuthToken.findFirst","AuthToken.findFirstOrThrow","AuthToken.findMany","AuthToken.createOne","AuthToken.createMany","AuthToken.createManyAndReturn","AuthToken.updateOne","AuthToken.updateMany","AuthToken.updateManyAndReturn","AuthToken.upsertOne","AuthToken.deleteOne","AuthToken.deleteMany","AuthToken.groupBy","AuthToken.aggregate","StaffAuditLog.findUnique","StaffAuditLog.findUniqueOrThrow","StaffAuditLog.findFirst","StaffAuditLog.findFirstOrThrow","StaffAuditLog.findMany","StaffAuditLog.createOne","StaffAuditLog.createMany","StaffAuditLog.createManyAndReturn","StaffAuditLog.updateOne","StaffAuditLog.updateMany","StaffAuditLog.updateManyAndReturn","StaffAuditLog.upsertOne","StaffAuditLog.deleteOne","StaffAuditLog.deleteMany","StaffAuditLog.groupBy","StaffAuditLog.aggregate","AND","OR","NOT","id","actorId","StaffActions","action","targetType","targetId","reason","metadata","ipAddress","createdAt","equals","in","notIn","lt","lte","gt","gte","not","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","contains","startsWith","endsWith","userId","TokenPurpose","purpose","tokenHash","expiresAt","usedAt","refreshTokenHash","userAgent","ip","lastUsedAt","revokedAt","AuthProvider","provider","providerUserId","email","emailVerifiedAt","passwordHash","passwordChangedAt","failedAttempts","lockedUntil","headline","username","displayName","avatarURL","UserRole","role","UserStatus","status","suspendedAt","suspendedReason","signupIp","lastLoginIp","lastLoginAt","updatedAt","deletedAt","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "wgIsUBwEAADCAQAgBQAAwwEAIAYAAMQBACAIAADFAQAgYgAAvQEAMGMAAAsAEGQAAL0BADBlAQAAAAFuQAC4AQAhjgEBAAAAAY8BQAC-AQAhkAEBALYBACGRAUAAvgEAIZIBAgC_AQAhkwFAAL4BACGUAQEAtgEAIZUBAQC2AQAhlgEBALYBACGXAQEAtgEAIZkBAADAAZkBIpsBAADBAZsBIpwBQAC-AQAhnQEBALYBACGeAQEAtgEAIZ8BAQC2AQAhoAFAAL4BACGhAUAAuAEAIaIBQAC-AQAhAQAAAAEAIA0DAAC5AQAgYgAAyQEAMGMAAAMAEGQAAMkBADBlAQCzAQAhbkAAuAEAIYABAQCzAQAhhAFAALgBACGGAQEAtQEAIYcBAQC1AQAhiAEBALYBACGJAUAAuAEAIYoBQAC4AQAhAgMAAKoCACCIAQAAygEAIA0DAAC5AQAgYgAAyQEAMGMAAAMAEGQAAMkBADBlAQAAAAFuQAC4AQAhgAEBALMBACGEAUAAuAEAIYYBAQAAAAGHAQEAAAABiAEBALYBACGJAUAAuAEAIYoBQAC4AQAhAwAAAAMAIAEAAAQAMAIAAAUAIAsDAADIAQAgYgAAxgEAMGMAAAcAEGQAAMYBADBlAQCzAQAhbkAAuAEAIYABAQCzAQAhggEAAMcBggEigwEBALUBACGEAUAAuAEAIYUBQAC-AQAhAgMAAKoCACCFAQAAygEAIAsDAADIAQAgYgAAxgEAMGMAAAcAEGQAAMYBADBlAQAAAAFuQAC4AQAhgAEBALMBACGCAQAAxwGCASKDAQEAAAABhAFAALgBACGFAUAAvgEAIQMAAAAHACABAAAIADACAAAJACAcBAAAwgEAIAUAAMMBACAGAADEAQAgCAAAxQEAIGIAAL0BADBjAAALABBkAAC9AQAwZQEAswEAIW5AALgBACGOAQEAtQEAIY8BQAC-AQAhkAEBALYBACGRAUAAvgEAIZIBAgC_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UQAgAwAAAAUAIBYAAEoAIBcAAE8AIAEAAAAFACABAAAAAwAgBAkAANsBACAeAADdAQAgHwAA3AEAIIgBAADKAQAgDGIAAKMBADBjAABYABBkAACjAQAwZQEAigEAIW5AAI8BACGAAQEAigEAIYQBQACPAQAhhgEBAIwBACGHAQEAjAEAIYgBAQCNAQAhiQFAAI8BACGKAUAAjwEAIQMAAAADACABAABXADAbAABYACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAIAwAA2gEAIGUBAAAAAW5AAAAAAYABAQAAAAGCAQAAAIIBAoMBAQAAAAGEAUAAAAABhQFAAAAAAQEPAABgACAHZQEAAAABbkAAAAABgAEBAAAAAYIBAAAAggECgwEBAAAAAYQBQAAAAAGFAUAAAAABAQ8AAGIAMAEPAABiADABAAAACwAgCAMAANkBACBlAQDOAQAhbkAA0QEAIYABAQDOAQAhggEAANcBggEigwEBAM4BACGEAUAA0QEAIYUBQADYAQAhAgAAAAkAIA8AAGYAIAdlAQDOAQAhbkAA0QEAIYABAQDOAQAhggEAANcBggEigwEBAM4BACGEAUAA0QEAIYUBQADYAQAhAgAAAAcAIA8AAGgAIAIAAAAHACAPAABoACABAAAACwAgAwAAAAkAIBYAAGAAIBcAAGYAIAEAAAAJACABAAAABwAgBAkAANQBACAeAADWAQAgHwAA1QEAIIUBAADKAQAgCmIAAJwBADBjAABwABBkAACcAQAwZQEAigEAIW5AAI8BACGAAQEAigEAIYIBAACdAYIBIoMBAQCMAQAhhAFAAI8BACGFAUAAngEAIQMAAAAHACABAABvADAbAABwACADAAAABwAgAQAACAAwAgAACQAgAQAAABMAIAEAAAATACADAAAAEQAgAQAAEgAwAgAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACAKBwAA0wEAIGUBAAAAAWYBAAAAAWgAAABoAmkBAAAAAWoBAAAAAWsBAAAAAWyAAAAAAW0BAAAAAW5AAAAAAQEPAAB4ACAJZQEAAAABZgEAAAABaAAAAGgCaQEAAAABagEAAAABawEAAAABbIAAAAABbQEAAAABbkAAAAABAQ8AAHoAMAEPAAB6ADAKBwAA0gEAIGUBAM4BACFmAQDOAQAhaAAAzwFoImkBAM4BACFqAQDOAQAhawEA0AEAIWyAAAAAAW0BANABACFuQADRAQAhAgAAABMAIA8AAH0AIAllAQDOAQAhZgEAzgEAIWgAAM8BaCJpAQDOAQAhagEAzgEAIWsBANABACFsgAAAAAFtAQDQAQAhbkAA0QEAIQIAAAARACAPAAB_ACACAAAAEQAgDwAAfwAgAwAAABMAIBYAAHgAIBcAAH0AIAEAAAATACABAAAAEQAgBgkAAMsBACAeAADNAQAgHwAAzAEAIGsAAMoBACBsAADKAQAgbQAAygEAIAxiAACJAQAwYwAAhgEAEGQAAIkBADBlAQCKAQAhZgEAigEAIWgAAIsBaCJpAQCMAQAhagEAigEAIWsBAI0BACFsAACOAQAgbQEAjQEAIW5AAI8BACEDAAAAEQAgAQAAhQEAMBsAAIYBACADAAAAEQAgAQAAEgAwAgAAEwAgDGIAAIkBADBjAACGAQAQZAAAiQEAMGUBAIoBACFmAQCKAQAhaAAAiwFoImkBAIwBACFqAQCKAQAhawEAjQEAIWwAAI4BACBtAQCNAQAhbkAAjwEAIQsJAACRAQAgHgAAmAEAIB8AAJgBACBvAQAAAAFwAQAAAARxAQAAAARyAQAAAAFzAQAAAAF0AQAAAAF1AQAAAAF2AQCbAQAhBwkAAJEBACAeAACaAQAgHwAAmgEAIG8AAABoAnAAAABoCHEAAABoCHYAAJkBaCIOCQAAkQEAIB4AAJgBACAfAACYAQAgbwEAAAABcAEAAAAEcQEAAAAEcgEAAAABcwEAAAABdAEAAAABdQEAAAABdgEAlwEAIX0BAAAAAX4BAAAAAX8BAAAAAQ4JAACTAQAgHgAAlgEAIB8AAJYBACBvAQAAAAFwAQAAAAVxAQAAAAVyAQAAAAFzAQAAAAF0AQAAAAF1AQAAAAF2AQCVAQAhfQEAAAABfgEAAAABfwEAAAABDwkAAJMBACAeAACUAQAgHwAAlAEAIG-AAAAAAXKAAAAAAXOAAAAAAXSAAAAAAXWAAAAAAXaAAAAAAXcBAAAAAXgBAAAAAXkBAAAAAXqAAAAAAXuAAAAAAXyAAAAAAQsJAACRAQAgHgAAkgEAIB8AAJIBACBvQAAAAAFwQAAAAARxQAAAAARyQAAAAAFzQAAAAAF0QAAAAAF1QAAAAAF2QACQAQAhCwkAAJEBACAeAACSAQAgHwAAkgEAIG9AAAAAAXBAAAAABHFAAAAABHJAAAAAAXNAAAAAAXRAAAAAAXVAAAAAAXZAAJABACEIbwIAAAABcAIAAAAEcQIAAAAEcgIAAAABcwIAAAABdAIAAAABdQIAAAABdgIAkQEAIQhvQAAAAAFwQAAAAARxQAAAAARyQAAAAAFzQAAAAAF0QAAAAAF1QAAAAAF2QACSAQAhCG8CAAAAAXACAAAABXECAAAABXICAAAAAXMCAAAAAXQCAAAAAXUCAAAAAXYCAJMBACEMb4AAAAABcoAAAAABc4AAAAABdIAAAAABdYAAAAABdoAAAAABdwEAAAABeAEAAAABeQEAAAABeoAAAAABe4AAAAABfIAAAAABDgkAAJMBACAeAACWAQAgHwAAlgEAIG8BAAAAAXABAAAABXEBAAAABXIBAAAAAXMBAAAAAXQBAAAAAXUBAAAAAXYBAJUBACF9AQAAAAF-AQAAAAF_AQAAAAELbwEAAAABcAEAAAAFcQEAAAAFcgEAAAABcwEAAAABdAEAAAABdQEAAAABdgEAlgEAIX0BAAAAAX4BAAAAAX8BAAAAAQ4JAACRAQAgHgAAmAEAIB8AAJgBACBvAQAAAAFwAQAAAARxAQAAAARyAQAAAAFzAQAAAAF0AQAAAAF1AQAAAAF2AQCXAQAhfQEAAAABfgEAAAABfwEAAAABC28BAAAAAXABAAAABHEBAAAABHIBAAAAAXMBAAAAAXQBAAAAAXUBAAAAAXYBAJgBACF9AQAAAAF-AQAAAAF_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-AQAAAAF_AQAAAAELbwEAAAABcAEAAAAFcQEAAAAFcgEAAAABcwEAAAABdAEAAAABdQEAAAABdgEAlgEAIX0BAAAAAX4BAAAAAX8BAAAAAQxvgAAAAAFygAAAAAFzgAAAAAF0gAAAAAF1gAAAAAF2gAAAAAF3AQAAAAF4AQAAAAF5AQAAAAF6gAAAAAF7gAAAAAF8gAAAAAEIb0AAAAABcEAAAAAEcUAAAAAEckAAAAABc0AAAAABdEAAAAABdUAAAAABdkAAkgEAIR4EAADCAQAgBQAAwwEAIAYAAMQBACAIAADFAQAgYgAAvQEAMGMAAAsAEGQAAL0BADBlAQCzAQAhbkAAuAEAIY4BAQC1AQAhjwFAAL4BACGQAQEAtgEAIZEBQAC-AQAhkgECAL8BACGTAUAAvgEAIZQBAQC2AQAhlQEBALYBACGWAQEAtgEAIZcBAQC2AQAhmQEAAMABmQEimwEAAMEBmwEinAFAAL4BACGdAQEAtgEAIZ4BAQC2AQAhnwEBALYBACGgAUAAvgEAIaEBQAC4AQAhogFAAL4BACGmAQAACwAgpwEAAAsAIAhvAQAAAAFwAQAAAARxAQAAAARyAQAAAAFzAQAAAAF0AQAAAAF1AQAAAAF2AQC6AQAhCgMAALkBACBiAAC7AQAwYwAADQAQZAAAuwEAMGUBALMBACFuQAC4AQAhgAEBALMBACGMAQAAvAGMASKNAQEAtQEAIY4BAQC1AQAhBG8AAACMAQJwAAAAjAEIcQAAAIwBCHYAAKcBjAEiHAQAAMIBACAFAADDAQAgBgAAxAEAIAgAAMUBACBiAAC9AQAwYwAACwAQZAAAvQEAMGUBALMBACFuQAC4AQAhjgEBALUBACGPAUAAvgEAIZABAQC2AQAhkQFAAL4BACGSAQIAvwEAIZMBQAC-AQAhlAEBALYBACGVAQEAtgEAIZYBAQC2AQAhlwEBALYBACGZAQAAwAGZASKbAQAAwQGbASKcAUAAvgEAIZ0BAQC2AQAhngEBALYBACGfAQEAtgEAIaABQAC-AQAhoQFAALgBACGiAUAAvgEAIQhvQAAAAAFwQAAAAAVxQAAAAAVyQAAAAAFzQAAAAAF0QAAAAAF1QAAAAAF2QACgAQAhCG8CAAAAAXACAAAABHECAAAABHICAAAAAXMCAAAAAXQCAAAAAXUCAAAAAXYCAJEBACEEbwAAAJkBAnAAAACZAQhxAAAAmQEIdgAArwGZASIEbwAAAJsBAnAAAACbAQhxAAAAmwEIdgAArQGbASIDowEAAAMAIKQBAAADACClAQAAAwAgA6MBAAAHACCkAQAABwAgpQEAAAcAIAOjAQAADQAgpAEAAA0AIKUBAAANACADowEAABEAIKQBAAARACClAQAAEQAgCwMAAMgBACBiAADGAQAwYwAABwAQZAAAxgEAMGUBALMBACFuQAC4AQAhgAEBALMBACGCAQAAxwGCASKDAQEAtQEAIYQBQAC4AQAhhQFAAL4BACEEbwAAAIIBAnAAAACCAQhxAAAAggEIdgAAogGCASIeBAAAwgEAIAUAAMMBACAGAADEAQAgCAAAxQEAIGIAAL0BADBjAAALABBkAAC9AQAwZQEAswEAIW5AALgBACGOAQEAtQEAIY8BQAC-AQAhkAEBALYBACGRAUAAvgEAIZIBAgC_AQAhkwFAAL4BACGUAQEAtgEAIZUBAQC2AQAhlgEBALYBACGXAQEAtgEAIZkBAADAAZkBIpsBAADBAZsBIpwBQAC-AQAhnQEBALYBACGeAQEAtgEAIZ8BAQC2AQAhoAFAAL4BACGhAUAAuAEAIaIBQAC-AQAhpgEAAAsAIKcBAAALACANAwAAuQEAIGIAAMkBADBjAAADABBkAADJAQAwZQEAswEAIW5AALgBACGAAQEAswEAIYQBQAC4AQAhhgEBALUBACGHAQEAtQEAIYgBAQC2AQAhiQFAALgBACGKAUAAuAEAIQAAAAABqwEBAAAAAQGrAQAAAGgCAasBAQAAAAEBqwFAAAAAAQUWAAC-AgAgFwAAwQIAIKgBAAC_AgAgqQEAAMACACCuAQAAAQAgAxYAAL4CACCoAQAAvwIAIK4BAAABACAAAAABqwEAAACCAQIBqwFAAAAAAQcWAAC5AgAgFwAAvAIAIKgBAAC6AgAgqQEAALsCACCsAQAACwAgrQEAAAsAIK4BAAABACADFgAAuQIAIKgBAAC6AgAgrgEAAAEAIAAAAAUWAAC0AgAgFwAAtwIAIKgBAAC1AgAgqQEAALYCACCuAQAAAQAgAxYAALQCACCoAQAAtQIAIK4BAAABACAAAAABqwEAAACMAQIFFgAArwIAIBcAALICACCoAQAAsAIAIKkBAACxAgAgrgEAAAEAIAMWAACvAgAgqAEAALACACCuAQAAAQAgAAAAAAAFqwECAAAAAbEBAgAAAAGyAQIAAAABswECAAAAAbQBAgAAAAEBqwEAAACZAQIBqwEAAACbAQILFgAAlgIAMBcAAJsCADCoAQAAlwIAMKkBAACYAgAwqgEAAJkCACCrAQAAmgIAMKwBAACaAgAwrQEAAJoCADCuAQAAmgIAMK8BAACcAgAwsAEAAJ0CADALFgAAigIAMBcAAI8CADCoAQAAiwIAMKkBAACMAgAwqgEAAI0CACCrAQAAjgIAMKwBAACOAgAwrQEAAI4CADCuAQAAjgIAMK8BAACQAgAwsAEAAJECADALFgAA_gEAMBcAAIMCADCoAQAA_wEAMKkBAACAAgAwqgEAAIECACCrAQAAggIAMKwBAACCAgAwrQEAAIICADCuAQAAggIAMK8BAACEAgAwsAEAAIUCADALFgAA8gEAMBcAAPcBADCoAQAA8wEAMKkBAAD0AQAwqgEAAPUBACCrAQAA9gEAMKwBAAD2AQAwrQEAAPYBADCuAQAA9gEAMK8BAAD4AQAwsAEAAPkBADAIZQEAAAABaAAAAGgCaQEAAAABagEAAAABawEAAAABbIAAAAABbQEAAAABbkAAAAABAgAAABMAIBYAAP0BACADAAAAEwAgFgAA_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-EAQdghwEoYYgBLA"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  AuthTokenScalarFieldEnum: () => AuthTokenScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  OAuthAccountScalarFieldEnum: () => OAuthAccountScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  StaffAuditLogScalarFieldEnum: () => StaffAuditLogScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.10.0",
  engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  OAuthAccount: "OAuthAccount",
  Session: "Session",
  AuthToken: "AuthToken",
  StaffAuditLog: "StaffAuditLog"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  email: "email",
  emailVerifiedAt: "emailVerifiedAt",
  passwordHash: "passwordHash",
  passwordChangedAt: "passwordChangedAt",
  failedAttempts: "failedAttempts",
  lockedUntil: "lockedUntil",
  headline: "headline",
  username: "username",
  displayName: "displayName",
  avatarURL: "avatarURL",
  role: "role",
  status: "status",
  suspendedAt: "suspendedAt",
  suspendedReason: "suspendedReason",
  signupIp: "signupIp",
  lastLoginIp: "lastLoginIp",
  lastLoginAt: "lastLoginAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var OAuthAccountScalarFieldEnum = {
  id: "id",
  userId: "userId",
  provider: "provider",
  providerUserId: "providerUserId",
  email: "email",
  createdAt: "createdAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  userId: "userId",
  refreshTokenHash: "refreshTokenHash",
  userAgent: "userAgent",
  ip: "ip",
  createdAt: "createdAt",
  lastUsedAt: "lastUsedAt",
  expiresAt: "expiresAt",
  revokedAt: "revokedAt"
};
var AuthTokenScalarFieldEnum = {
  id: "id",
  userId: "userId",
  purpose: "purpose",
  tokenHash: "tokenHash",
  expiresAt: "expiresAt",
  usedAt: "usedAt",
  createdAt: "createdAt"
};
var StaffAuditLogScalarFieldEnum = {
  id: "id",
  actorId: "actorId",
  action: "action",
  targetType: "targetType",
  targetId: "targetId",
  reason: "reason",
  metadata: "metadata",
  ipAddress: "ipAddress",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/middleware/errorHandler.ts
var { JsonWebTokenError, TokenExpiredError } = jwt;
var errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof ZodError) {
    res.status(400).json({
      error: "Invalid Input",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
    });
  } else if (err instanceof JsonWebTokenError) {
    res.status(401).json({ error: "invalid or expired token" });
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({ error: "Email already exists" });
  } else {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// src/routes/index.ts
import { Router as Router2 } from "express";

// src/routes/auth.routes.ts
import { Router } from "express";

// src/controllers/auth.controller.ts
import { z as z2 } from "zod";

// src/services/auth.service.ts
import bcrypt from "bcryptjs";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/config/env.ts
import "dotenv/config";
import { z } from "zod";
var schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  APP_URL: z.string().default("http://localhost:3001"),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1)
});
var env = schema.parse(process.env);

// src/lib/prisma.ts
var connectionString = `${env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/utils/tokens.ts
import crypto from "crypto";
import jwt2 from "jsonwebtoken";
var ACCESS_TTL_SECONDS = 15 * 60;
var REFRESH_TTL_SECONDS = 7 * 60 * 60 * 24;
var signAccessToken = (userId, role) => {
  return jwt2.sign({ role }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: ACCESS_TTL_SECONDS
  });
};
var verifyAccessToken = (token) => {
  const payload = jwt2.verify(token, env.JWT_ACCESS_SECRET);
  return { userId: payload.sub, role: payload.role };
};
var signRefreshToken = (userId) => {
  return jwt2.sign({}, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: REFRESH_TTL_SECONDS,
    jwtid: crypto.randomUUID()
  });
};
var verifyRefreshToken = (token) => {
  const payload = jwt2.verify(token, env.JWT_REFRESH_SECRET);
  return { userId: payload.sub };
};
var hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
var generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// src/utils/mailer.ts
import { Resend } from "resend";
var resend = new Resend(env.RESEND_API_KEY);
async function sendSignupVerificationEmail(to, link) {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Verify Your Email",
    html: `<p>Click below to verify your email address. This link expires in 24 hour.</p>
           <p><a href="${link}">${link}</a></p>`
  });
}
async function sendPasswordResetEmail(to, link) {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset Password",
    html: `<p>Click below to reset your password. This link expires in 1 hour.</p>
           <p><a href="${link}">${link}</a></p>`
  });
}

// src/services/auth.service.ts
var BCRYPT_ROUNDS = 12;
var DUMMY_HASH = bcrypt.hashSync("dummy", BCRYPT_ROUNDS);
var toPublicUser = (user) => {
  return {
    id: user?.id,
    email: user?.email,
    username: user?.username,
    displayName: user?.displayName,
    role: user?.role,
    emailVerified: user?.emailVerifiedAt
  };
};
var startSession = async (user, client) => {
  const refreshToken = signRefreshToken(user?.id);
  await prisma.session.create({
    data: {
      userId: user?.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: client.userAgent ?? "",
      ip: client.ip,
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1e3)
    }
  });
  return { accessToken: signAccessToken(user.id, user.role), refreshToken };
};
var signup = async (input, client) => {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.username,
      username: input.username,
      signupIp: client.ip
    }
  });
  const token = generateRandomToken();
  await prisma.authToken.create({
    data: {
      userId: user.id,
      purpose: "verify_email",
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
    }
  });
  await sendSignupVerificationEmail(user.email, `${env.APP_URL}/verify-email?token=${token}`);
  return { user };
};
var verifySignupEmail = async (token) => {
  const record = await prisma.authToken.findUnique({
    where: { tokenHash: hashToken(token) }
  });
  if (!record || record.purpose !== "verify_email" || record.expiresAt < /* @__PURE__ */ new Date()) {
    throw new AppError(400, "Verification link is invalid or has expired");
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: /* @__PURE__ */ new Date() }
    }),
    prisma.authToken.update({
      where: { id: record.id },
      data: { usedAt: /* @__PURE__ */ new Date() }
    })
  ]);
};
var resendVerificationEmail = async (email2) => {
  const user = await prisma.user.findUnique({ where: { email: email2 } });
  if (!user || user.deletedAt || user.emailVerifiedAt) {
    throw new AppError(400, "User not found or already verified");
  }
  const token = generateRandomToken();
  await prisma.$transaction([
    prisma.authToken.deleteMany({
      where: { userId: user.id, purpose: "verify_email", usedAt: null }
    }),
    prisma.authToken.create({
      data: {
        userId: user.id,
        purpose: "verify_email",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
      }
    })
  ]);
  await sendSignupVerificationEmail(user.email, `${env.APP_URL}/verify-email?token=${token}`);
};
var loginUser = async (email2, password2, client) => {
  const user = await prisma.user.findUnique({ where: { email: email2 } });
  const passwordOk = await bcrypt.compare(password2, user?.passwordHash ?? DUMMY_HASH) ? user?.passwordHash : DUMMY_HASH;
  if (!user || user.deletedAt || !passwordOk || !user.passwordHash) {
    throw new AppError(401, "Invalid email or password");
  }
  if (user.status === "suspended") {
    throw new AppError(403, "Account is suspended");
  }
  if (!user.emailVerifiedAt) {
    throw new AppError(403, "Please verify your email before logging in");
  }
  return { user, ...await startSession(user, client) };
};
var refreshSession = async (refreshToken) => {
  const { userId } = verifyRefreshToken(refreshToken);
  const session = await prisma.session.findFirst({
    where: { refreshTokenHash: hashToken(refreshToken) }
  });
  if (!session) {
    await prisma.session.updateMany({
      where: { userId },
      data: { revokedAt: /* @__PURE__ */ new Date() }
    });
    throw new AppError(401, "Invalid refresh Token");
  }
  if (session.expiresAt < /* @__PURE__ */ new Date() || session.revokedAt) {
    throw new AppError(401, "Session expired, please log in again");
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.deletedAt || user.status !== "active" || !user.emailVerifiedAt) {
    throw new AppError(401, "Account unavailable");
  }
  const newRefreshToken = signRefreshToken(user.id);
  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashToken(newRefreshToken),
      lastUsedAt: /* @__PURE__ */ new Date(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1e3)
    }
  });
  return { user, accessToken: signAccessToken(user.id, user.role), refreshToken: newRefreshToken };
};
var logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  await prisma.session.updateMany({
    where: { refreshTokenHash: hashToken(refreshToken) },
    data: { revokedAt: /* @__PURE__ */ new Date() }
  });
};
var forgotPasswordService = async (email2) => {
  const user = await prisma.user.findUnique({ where: { email: email2 } });
  if (!user || user.deletedAt || user.status !== "active") return;
  const token = generateRandomToken();
  await prisma.$transaction([
    prisma.authToken.deleteMany({
      where: { userId: user.id, purpose: "reset_password", usedAt: null }
    }),
    prisma.authToken.create({
      data: {
        userId: user.id,
        purpose: "reset_password",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1e3)
      }
    })
  ]);
  await sendPasswordResetEmail(user.email, `${env.APP_URL}/reset-password?token=${token}`);
};
var resetPasswordService = async (token, newPassword) => {
  const record = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.purpose !== "reset_password" || record.usedAt || record.expiresAt < /* @__PURE__ */ new Date()) {
    throw new AppError(400, "Reset link is invalid or has expired");
  }
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const now = /* @__PURE__ */ new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.id }, data: { passwordHash } }),
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    prisma.session.updateMany({
      where: { userId: record.userId },
      data: { revokedAt: now }
    })
  ]);
};
var getUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.deletedAt) throw new AppError(404, "User not Found");
  return user;
};

// src/utils/cookies.ts
var REFRESH_COOKIE = "refresh_token";
var baseOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/auth"
};
var setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions,
    maxAge: REFRESH_TTL_SECONDS * 1e3
  });
};
var clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, baseOptions);
};

// src/controllers/auth.controller.ts
var email = z2.string().trim().toLowerCase().email();
var password = z2.string().min(8).max(80).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character" });
var signUpSchema = z2.object({
  username: z2.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers and underscores" }),
  email,
  password
});
var verifyEmailSchema = z2.object({ token: z2.string().min(1) });
var resendSchema = z2.object({ email });
var loginSchema = z2.object({ email, password: z2.string().min(8).max(80) });
var forgetSchema = z2.object({ email });
var resetSchema = z2.object({ token: z2.string().min(1), password });
var clientInfo = (req) => ({
  ip: req.ip,
  userAgent: req.get("user-agent")
});
var signUp = async (req, res) => {
  const body = signUpSchema.parse(req.body);
  const { user } = await signup(body, clientInfo(req));
  res.status(201).json({ user: toPublicUser(user), message: "Account created. Check your email to verify before logging in.", status: 201 });
};
var verifyEmail = async (req, res) => {
  const { token } = verifyEmailSchema.parse(req.query);
  await verifySignupEmail(token);
  res.status(200).json({ message: "Email verified successfully. You can now log in.", status: 200 });
};
var resendVerification = async (req, res) => {
  const { email: email2 } = resendSchema.parse(req.body);
  await resendVerificationEmail(email2);
  res.status(200).json({ message: "Verification email sent. Check your inbox.", status: 200 });
};
var login = async (req, res) => {
  const { email: email2, password: password2 } = loginSchema.parse(req.body);
  const { accessToken, refreshToken } = await loginUser(email2, password2, clientInfo(req));
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ accessToken, refreshToken, message: "Logged in successfully", status: 200 });
};
var refresh = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new AppError(401, "No refresh Token provided");
  const { user, accessToken, refreshToken } = await refreshSession(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, refreshToken, message: "Session refreshed successfully", status: 200 });
};
var logout = async (req, res) => {
  await logoutUser(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(200).json({ message: "Logged out successfully", status: 200 });
};
var forgotPassword = async (req, res) => {
  const { email: email2 } = forgetSchema.parse(req.body);
  await forgotPasswordService(email2);
  res.status(200).json({ message: "If that email exists, a reset link has been sent.", status: 200 });
};
var resetPassword = async (req, res) => {
  const { token, password: password2 } = resetSchema.parse(req.body);
  await resetPasswordService(token, password2);
  clearRefreshCookie(res);
  res.status(200).json({ message: "Password Updated,Please login Again", status: 200 });
};
var me = async (req, res) => {
  const user = await getUser(res.locals.userId);
  res.status(200).json({ user: toPublicUser(user), message: "Password Updated,Please login Again", status: 200 });
};

// src/middleware/requireAuth.ts
var requiredAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing Access Token");
  }
  const { userId, role } = verifyAccessToken(header.slice("Bearer ".length));
  res.locals.userId = userId;
  res.locals.role = role;
  next();
};

// src/routes/auth.routes.ts
var router = Router();
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", requiredAuth, me);
var auth_routes_default = router;

// src/routes/index.ts
var router2 = Router2();
router2.use("/auth", auth_routes_default);
var routes_default = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/health", async (_req, res) => {
  res.json({ message: "Success set up backend" });
});
app.use(routes_default);
app.use(errorHandler);
var app_default = app;

// src/server.ts
app_default.listen(
  env.PORT,
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server running on port ${env.PORT}`);
  }
);
