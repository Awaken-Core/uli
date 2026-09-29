import { relations } from "drizzle-orm/_relations";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { session, user } from "./user";

export const oauthResource = pgTable("oauth_resource", {
  id: t.text("id").primaryKey(),
  identifier: t.text("identifier").notNull().unique(),
  name: t.text("name").notNull(),
  accessTokenTtl: t.integer("access_token_ttl"),
  refreshTokenTtl: t.integer("refresh_token_ttl"),
  signingAlgorithm: t.text("signing_algorithm"),
  signingKeyId: t.text("signing_key_id"),
  allowedScopes: t.text("allowed_scopes").array(),
  customClaims: t.jsonb("custom_claims"),
  dpopBoundAccessTokensRequired: t.boolean("dpop_bound_access_tokens_required").default(false),
  disabled: t.boolean("disabled").default(false),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }),
  updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }),
  policyVersion: t.integer("policy_version").default(1),
  metadata: t.jsonb("metadata"),
});

export const jwks = pgTable("jwks", {
  id: t.text("id").primaryKey(),
  publicKey: t.text("public_key").notNull(),
  privateKey: t.text("private_key").notNull(),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
  expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }),
  alg: t.text("alg"),
  crv: t.text("crv"),
});

export const oauthClient = pgTable("oauth_client", {
  id: t.text("id").primaryKey(),
  clientId: t.varchar("client_id", { length: 255 }).notNull().unique(),
  clientSecret: t.text("client_secret"),
  disabled: t.boolean("disabled"),
  skipConsent: t.boolean("skip_consent"),
  enableEndSession: t.boolean("enable_end_session"),
  subjectType: t.text("subject_type"),
  scopes: t.text("scopes").array(),
  clientCredentialsScopes: t.text("client_credentials_scopes").array().default([]),
  userId: t.text("user_id").references(() => user.id, { onDelete: "cascade" }),
  referenceId: t.text("reference_id"),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }),
  updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }),
  name: t.text("name"),
  uri: t.text("uri"),
  icon: t.text("icon"),
  contacts: t.text("contacts").array(),
  tos: t.text("tos"),
  policy: t.text("policy"),
  softwareId: t.text("software_id"),
  softwareVersion: t.text("software_version"),
  softwareStatement: t.text("software_statement"),
  redirectUris: t.text("redirect_uris").array().notNull(),
  postLogoutRedirectUris: t.text("post_logout_redirect_uris").array(),
  backchannelLogoutUri: t.text("backchannel_logout_uri"),
  backchannelLogoutSessionRequired: t.boolean("backchannel_logout_session_required"),
  tokenEndpointAuthMethod: t.text("token_endpoint_auth_method"),
  grantTypes: t.text("grant_types").array(),
  responseTypes: t.text("response_types").array(),
  applicationType: t.text("application_type"),
  jwks: t.text("jwks"),
  jwksUri: t.text("jwks_uri"),
  clientDiscoveryId: t.text("client_discovery_id"),
  requirePKCE: t.boolean("require_pkce"),
  dpopBoundAccessTokens: t.boolean("dpop_bound_access_tokens"),
  metadata: t.jsonb("metadata"),
});

export const oauthClientResource = pgTable(
  "oauth_client_resource",
  {
    id: t.text("id").primaryKey(),
    clientId: t.text("client_id").notNull().references(() => oauthClient.clientId, { onDelete: "cascade" }),
    resourceId: t.text("resource_id").notNull().references(() => oauthResource.identifier, { onDelete: "cascade" }),
    metadata: t.jsonb("metadata"),
    createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }),
  },
  (table) => [
    t.uniqueIndex("oauthClientResource_clientId_resourceId_uidx").on(table.clientId, table.resourceId),
    t.index("oauthClientResource_clientId_idx").on(table.clientId),
    t.index("oauthClientResource_resourceId_idx").on(table.resourceId),
  ],
);

export const oauthRefreshToken = pgTable("oauth_refresh_token", {
  id: t.text("id").primaryKey(),
  token: t.text("token").notNull().unique(),
  clientId: t.varchar("client_id", { length: 36 }).notNull().references(() => oauthClient.clientId, { onDelete: "cascade" }),
  sessionId: t.text("session_id").references(() => session.id, { onDelete: "set null" }),
  userId: t.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  referenceId: t.text("reference_id"),
  authorizationCodeId: t.text("authorization_code_id"),
  resources: t.text("resources").array(),
  requestedUserInfoClaims: t.text("requested_user_info_claims").array(),
  scopes: t.text("scopes").array().notNull(),
  revoked: t.timestamp("revoked", { precision: 6, withTimezone: true }),
  rotatedAt: t.timestamp("rotated_at", { precision: 6, withTimezone: true }),
  rotationReplayResponse: t.text("rotation_replay_response"),
  rotationReplayExpiresAt: t.timestamp("rotation_replay_expires_at", { precision: 6, withTimezone: true }),
  authTime: t.timestamp("auth_time", { precision: 6, withTimezone: true }),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
  expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
  confirmation: t.jsonb("confirmation"),
});

export const oauthAccessToken = pgTable("oauth_access_token", {
  id: t.text("id").primaryKey(),
  token: t.varchar("token", { length: 255 }).notNull().unique(),
  clientId: t.varchar("client_id", { length: 36 }).notNull().references(() => oauthClient.clientId, { onDelete: "cascade" }),
  sessionId: t.text("session_id").references(() => session.id, { onDelete: "set null" }),
  refreshId: t.text("refresh_id").references(() => oauthRefreshToken.id, { onDelete: "cascade" }),
  userId: t.text("user_id").references(() => user.id, { onDelete: "cascade" }),
  referenceId: t.text("reference_id"),
  authorizationCodeId: t.text("authorization_code_id"),
  resources: t.text("resources").array(),
  requestedUserInfoClaims: t.text("requested_user_info_claims").array(),
  scopes: t.text("scopes").array().notNull(),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
  expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
  confirmation: t.jsonb("confirmation"),
  revoked: t.timestamp("revoked", { precision: 6, withTimezone: true }),
});

export const oauthConsent = pgTable("oauth_consent", {
  id: t.text("id").primaryKey(),
  userId: t.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  clientId: t.varchar("client_id", { length: 36 }).notNull().references(() => oauthClient.clientId, { onDelete: "cascade" }),
  referenceId: t.text("reference_id"),
  resources: t.text("resources").array(),
  scopes: t.text("scopes").array().notNull(),
  requestedUserInfoClaims: t.text("requested_user_info_claims").array(),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
  updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
});

export const oauthClientAssertion = pgTable("oauth_client_assertion", {
  id: t.text("id").primaryKey(),
  expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
});

export const oauthClientRelations = relations(oauthClient, ({ one, many }) => ({
  user: one(user, {
    fields: [oauthClient.userId],
    references: [user.id],
  }),
  refreshTokens: many(oauthRefreshToken),
  accessTokens: many(oauthAccessToken),
  consents: many(oauthConsent),
  resources: many(oauthClientResource),
}));

export const oauthResourceRelations = relations(oauthResource, ({ many }) => ({
  clients: many(oauthClientResource),
}));

export const oauthClientResourceRelations = relations(oauthClientResource, ({ one }) => ({
  client: one(oauthClient, {
    fields: [oauthClientResource.clientId],
    references: [oauthClient.clientId],
  }),
  resource: one(oauthResource, {
    fields: [oauthClientResource.resourceId],
    references: [oauthResource.identifier],
  }),
}));

export const oauthRefreshTokenRelations = relations(
  oauthRefreshToken,
  ({ one, many }) => ({
    client: one(oauthClient, {
      fields: [oauthRefreshToken.clientId],
      references: [oauthClient.clientId],
    }),
    session: one(session, {
      fields: [oauthRefreshToken.sessionId],
      references: [session.id],
    }),
    user: one(user, {
      fields: [oauthRefreshToken.userId],
      references: [user.id],
    }),
    accessTokens: many(oauthAccessToken),
  }),
);

export const oauthAccessTokenRelations = relations(oauthAccessToken, ({ one }) => ({
  client: one(oauthClient, {
    fields: [oauthAccessToken.clientId],
    references: [oauthClient.clientId],
  }),
  session: one(session, {
    fields: [oauthAccessToken.sessionId],
    references: [session.id],
  }),
  refreshToken: one(oauthRefreshToken, {
    fields: [oauthAccessToken.refreshId],
    references: [oauthRefreshToken.id],
  }),
  user: one(user, {
    fields: [oauthAccessToken.userId],
    references: [user.id],
  }),
}));

export const oauthConsentRelations = relations(oauthConsent, ({ one }) => ({
  user: one(user, {
    fields: [oauthConsent.userId],
    references: [user.id],
  }),
  client: one(oauthClient, {
    fields: [oauthConsent.clientId],
    references: [oauthClient.clientId],
  }),
}));
