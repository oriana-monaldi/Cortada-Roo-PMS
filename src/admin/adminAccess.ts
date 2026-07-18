export const ADMIN_EMAIL = "facuaiello82@gmail.com";

export const isAdminEmail = (email: string | null | undefined) =>
  email?.trim().toLowerCase() === ADMIN_EMAIL;
