// There is no real authentication system yet (the /login page is UI-only —
// see docs/research/.../ARTIFACT_MANIFEST.md). Until real sessions exist,
// every request is treated as this fixed demo org/user (seeded by db/seed.sql).
// Replace this once login actually issues a session.
export const CURRENT_ORG_ID = 1;
export const CURRENT_USER_ID = 1;
