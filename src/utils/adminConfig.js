export const AUTHORIZED_ADMINS = [
  'darshanbhandigare9@gmail.com'
];

export const isAdmin = (email) => {
  if (!email) return false;
  return AUTHORIZED_ADMINS.includes(email.toLowerCase());
};
