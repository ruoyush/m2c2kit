import { ShapeType } from "./ShapeType";
import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";
import { RectOptions } from "./RectOptions";

export interface ShapeOptions extends EntityOptions, DrawableOptions {
  shapeType?: ShapeType;
  /** If provided, shape will be a circle with given radius */
  circleOfRadius?: number;
  /** If provided, shape will be a rectangle as specified in {@link Rect} */
  rect?: RectOptions;
  /** Radius of rectangle's corners */
  cornerRadius?: number;
  /** Color with which to fill shape. Default is Constants.DEFAULT_SHAPE_FILL_COLOR (WebColors.Red)  */
  fillColor?: RgbaColor;
  /** Color with which to outline shape. Default is no color */
  strokeColor?: RgbaColor;
  /** Width of outline. Default is undefined */
  lineWidth?: number;
}
