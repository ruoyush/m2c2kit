import { SessionLifecycleEvent } from "./SessionLifecycleEvent";

export interface SessionCallbacks {
  /** Callback executed when the session lifecycle changes, such as when it is initialized. */
  onSessionLifecycleChange?: (event: SessionLifecycleEvent) => void;
}
