export const ADMIN_EMAIL = "complejolopezsantafe@gmail.com";

export const isAdminEmail = (email: string | null | undefined) =>
  email?.trim().toLowerCase() === ADMIN_EMAIL;
