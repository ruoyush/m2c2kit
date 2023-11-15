import { Point } from "./Point";

export interface DrawableOptions {
  /** Point within the entity that determines its position. Default is &#123; x: 0.5, y: 0.5 &#125;, which centers the entity on its position */
  anchorPoint?: Point;
  /** Value along the z-axis to determine drawing and tap order. Larger values are on top. */
  zPosition?: number;
}
