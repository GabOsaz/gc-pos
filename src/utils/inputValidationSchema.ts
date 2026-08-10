
export function validateNameInput(str: string) {
  const regex = /^[a-zA-Z'-]+$/; // contains only letters, - and '
  return !regex.test(str);
}

export function validateNameInputLength(str: string) {
  return str.length < 2;
}

export function validateEmail(str: string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return !regex.test(str);
}

export function validatePhoneNumber(str: string) {
  const regex = /^0\d{10}$/; // start with 0 and have 11 digits
  return !regex.test(str);
}

export const isUpperCase = (str: string) => /[A-Z]/.test(str);
// eslint-disable-next-line no-useless-escape
const regex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]+/;
export const hasSpecialCharacter = (str: string) => regex.test(str);
