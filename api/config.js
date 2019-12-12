import os from "os";

const SMS_TIMER = 60;
const SALT_ROUNDS = 10;
const SECRET = "ROFL";
const SMS_API = "2f82b8bd-3c40-e724-1d0b-89ef624cc9b4";
const hostname = os.hostname();

export {
  SMS_TIMER, SALT_ROUNDS, SECRET, SMS_API, hostname,
};
