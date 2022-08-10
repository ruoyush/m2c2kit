import { EntityEvent } from "./EntityEvent";
import { Point } from "./Point";

export interface TapEvent extends EntityEvent {
  /** Point that was tapped on entity, relative to the entity coordinate system */
  point: Point;
  /** Buttons being pressed when event was fired. Taken from DOM MouseEvent.buttons */
  buttons: number;
}
