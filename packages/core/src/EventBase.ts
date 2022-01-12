export interface EventBase {
  eventType: EventType;
}
/** Note: I would have named it Event, but that would collide with
 * the existing, and much more well-known, Web API Event */

export enum EventType {
  sessionLifecycle = "SessionLifecycle",
  gameLifecycle = "GameLifecycle",
  gameTrial = "GameTrial",
}
