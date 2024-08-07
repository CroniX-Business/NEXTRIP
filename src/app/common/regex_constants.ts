export const passwordRegex: RegExp =
  /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])^[^\s]+$/;
export const usernameRegex: RegExp = /^[a-zA-Z0-9_.]+$/;
export const emailRegex: RegExp = /^([\w.-]+)@([\w-]+)((\.(\w){2,9})+)$/;
export const nameRegex: RegExp = /^(?=.{1,40}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/;
export const firstAndLastNameRegex: RegExp = /^[a-z ,.'-]+$/i;