import { GlobalVariables } from "./GlobalVariables";

declare global {
  // eslint-disable-next-line no-var
  var Globals: GlobalVariables;
}

globalThis.Globals = new GlobalVariables();
export {};
