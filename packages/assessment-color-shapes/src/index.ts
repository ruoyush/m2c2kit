import {
  Game,
  Action,
  Scene,
  Shape,
  Label,
  Transition,
  TransitionDirection,
  WebColors,
  RandomDraws,
  GameParameters,
  GameOptions,
  TrialSchema,
  Timer,
  Easings,
  RgbaColor,
  Sprite,
  Constants,
} from "@m2c2kit/core";
import { Button, Grid, Instructions, CountdownScene } from "@m2c2kit/addons";

/**
 * Color Shapes is a visual array change detection task, measuring intra-item
 * feature binding, where participants determine if shapes change color across
 * two sequential presentations of shape stimuli.
 */
class ColorShapes extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * Each game parameter should have a type, default (this is the default
     * value), and a description.
     */
    const defaultParameters: GameParameters = {
      fixation_duration_ms: {
        default: 500,
        description: "How long fixation scene is shown, milliseconds.",
        type: "number",
      },
      shape_colors: {
        type: "array",
        description: "Array of colors for shapes.",
        items: {
          type: "object",
          properties: {
            colorName: {
              type: "string",
              description: "Human-friendly name of color.",
            },
            rgbaColor: {
              type: "array",
              description: "Color as array, [r,g,b,a].",
              items: {
                type: "number",
              },
            },
          },
        },
        default: [
          { colorName: "black", rgbaColor: [0, 0, 0, 1] },
          { colorName: "green", rgbaColor: [0, 158, 115, 1] },
          { colorName: "yellow", rgbaColor: [240, 228, 66, 1] },
          { colorName: "blue", rgbaColor: [0, 114, 178, 1] },
          { colorName: "orange", rgbaColor: [213, 94, 0, 1] },
          { colorName: "pink", rgbaColor: [204, 121, 167, 1] },
        ],
      },
      number_of_shapes_shown: {
        default: 3,
        description: "How many shapes to show on the grid at one time.",
        type: "integer",
      },
      shapes_presented_duration_ms: {
        default: 2000,
        description: "How long the shapes are shown, milliseconds.",
        type: "number",
      },
      shapes_removed_duration_ms: {
        default: 1000,
        description:
          "How long to show a blank square after shapes are removed, milliseconds.",
        type: "number",
      },
      cells_per_side: {
        default: 3,
        description:
          "How many cell positions for each side of the square grid (e.g., 3 is a 3x3 grid; 4 is a 4x4 grid).",
        type: "integer",
      },
      number_of_different_colors_trials: {
        default: 2,
        type: "integer",
        description:
          "Number of trials where the shapes have different colors. If shapes have different colors in a trial, anywhere from 2 to (number of shapes) will be given different colors.",
      },
      number_of_trials: {
        default: 4,
        description: "How many trials to run.",
        type: "integer",
      },
      show_trials_complete_scene: {
        default: true,
        type: "boolean",
        description:
          "After the final trial, should a completion scene be shown? Otherwise, the game will immediately end.",
      },
      trials_complete_scene_text: {
        default: "You have completed all the color shapes trials",
        description: "Text for scene displayed after all trials are complete.",
        type: "string",
      },
      trials_complete_scene_button_text: {
        default: "OK",
        description:
          "Button text for scene displayed after all trials are complete.",
        type: "string",
      },
      instruction_type: {
        default: "long",
        description: "Type of instructions to show, 'short' or 'long'.",
        type: "string",
        enum: ["short", "long"],
      },
      show_quit_button: {
        type: "boolean",
        default: true,
        description: "Should the activity quit button be shown?",
      },
      show_fps: {
        type: "boolean",
        default: false,
        description: "Should the FPS be shown?",
      },
    };

    /**
     * This describes all the data that will be generated by the assessment.
     * At runtime, when a trial completes, the data will be returned to the
     * session with a callback, along with this schema transformed into
     * JSON Schema.
     */
    const colorShapesTrialSchema: TrialSchema = {
      activity_begin_iso8601_timestamp: {
        type: "string",
        format: "date-time",
        description:
          "ISO 8601 timestamp at the beginning of the game activity.",
      },
      trial_begin_iso8601_timestamp: {
        type: ["string", "null"],
        format: "date-time",
        description:
          "ISO 8601 timestamp at the beginning of the trial. Null if trial was skipped.",
      },
      trial_end_iso8601_timestamp: {
        type: ["string", "null"],
        format: "date-time",
        description:
          "ISO 8601 timestamp at the end of the trial (when user presses 'Same' or 'Different'). Null if trial was skipped.",
      },
      trial_index: {
        type: ["integer", "null"],
        description: "Index of the trial within this assessment, 0-based.",
      },
      present_shapes: {
        description:
          "Configuration of shapes shown to the user in the presentation phase. Null if trial was skipped.",
        type: ["array", "null"],
        items: {
          type: "object",
          properties: {
            shape_index: {
              type: "integer",
              description:
                "Index of the shape within the library of shapes, 0-based",
            },
            color_name: {
              type: "string",
              description: "Human-friendly name of color.",
            },
            rgba_color: {
              type: "array",
              description: "Color as array, [r,g,b,a].",
              items: {
                type: "number",
              },
            },
            location: {
              type: "object",
              description: "Location of shape.",
              properties: {
                row: {
                  type: "number",
                  description: "Row of the shape, 0-based.",
                },
                column: {
                  type: "number",
                  description: "Column of the shape, 0-based.",
                },
              },
            },
          },
        },
      },
      response_shapes: {
        description:
          "Configuration of shapes shown to the user in the response phase. Null if trial was skipped.",
        type: ["array", "null"],
        items: {
          type: "object",
          properties: {
            shape_index: {
              type: "integer",
              description:
                "Index of the shape within the library of shapes, 0-based",
            },
            color_name: {
              type: "string",
              description: "Human-friendly name of color.",
            },
            rgba_color: {
              type: "array",
              description: "Color as array, [r,g,b,a].",
              items: {
                type: "number",
              },
            },
            location: {
              type: "object",
              description: "Location of shape.",
              properties: {
                row: {
                  type: "number",
                  description: "Row of the shape, 0-based.",
                },
                column: {
                  type: "number",
                  description: "Column of the shape, 0-based.",
                },
              },
            },
          },
        },
      },
      number_of_different_shapes: {
        type: ["integer", "null"],
        description:
          "Number of shapes shown with different colors in the response phase.",
      },
      response_time_duration_ms: {
        type: ["number", "null"],
        description:
          "Milliseconds from when the response configuration of shapes is shown until the user taps a response. Null if trial was skipped.",
      },
      user_response: {
        type: ["string", "null"],
        enum: ["same", "different"],
        description:
          "User's response to whether the shapes are same colors or different.",
      },
      user_response_correct: {
        type: ["boolean", "null"],
        description: "Was the user's response correct?",
      },
      quit_button_pressed: {
        type: "boolean",
        description: "Was the quit button pressed?",
      },
    };

    const options: GameOptions = {
      name: "Color Shapes",
      /**
       * This id must match the property m2c2kit.assessmentId in package.json
       */
      id: "color-shapes",
      version: "__PACKAGE_JSON_VERSION__",
      moduleMetadata: Constants.MODULE_METADATA_PLACEHOLDER,
      shortDescription:
        "Color Shapes is a visual array change detection \
task, measuring intra-item feature binding, where participants determine \
if shapes change color across two sequential presentations of shape \
stimuli.",
      longDescription: `Color Shapes is a change detection paradigm used \
to measure visual short-term memory binding (Parra et al., 2009). \
Participants are asked to memorize the shapes and colors of three different \
polygons for 3 seconds. The three polygons are then removed from the screen \
and re-displayed at different locations, either having the same or different \
colors. Participants are then asked to decide whether the combination of \
colors and shapes are the "Same" or "Different" between the study and test \
phases.`,
      showFps: defaultParameters.show_fps.default,
      width: 400,
      height: 800,
      trialSchema: colorShapesTrialSchema,
      parameters: defaultParameters,
      fonts: [
        {
          fontName: "roboto",
          url: "fonts/roboto/Roboto-Regular.ttf",
        },
      ],
      images: [
        {
          imageName: "instructions-1",
          height: 256,
          width: 256,
          url: "images/cs-instructions-1.png",
        },
        {
          imageName: "instructions-2",
          height: 256,
          width: 256,
          url: "images/cs-instructions-2.png",
        },
        {
          imageName: "instructions-3",
          height: 330,
          width: 256,
          url: "images/cs-instructions-3.png",
        },
        {
          imageName: "circle-x",
          height: 32,
          width: 32,
          // the svg is from evericons and is licensed under CC0 1.0
          // Universal (Public Domain). see https://www.patreon.com/evericons
          url: "images/circle-x.svg",
        },
      ],
    };

    super(options);
  }

  override async initialize() {
    await super.initialize();
    // just for convenience, alias the variable game to "this"
    // (even though eslint doesn't like it)
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    const SHAPE_SVG_HEIGHT = 96;
    const SQUARE_SIDE_LENGTH = 350;
    const numberOfShapesShown = game.getParameter<number>(
      "number_of_shapes_shown",
    );
    const shapeLibrary = this.makeShapes(SHAPE_SVG_HEIGHT);

    // ==============================================================

    if (game.getParameter<boolean>("show_quit_button")) {
      const quitSprite = new Sprite({
        imageName: "circle-x",
        position: { x: 380, y: 20 },
        isUserInteractionEnabled: true,
      });
      game.addFreeNode(quitSprite);
      quitSprite.onTapDown((e) => {
        game.removeAllFreeNodes();
        e.handled = true;
        const blankScene = new Scene();
        game.addScene(blankScene);
        game.presentScene(blankScene);
        game.addTrialData("quit_button_pressed", true);
        game.trialComplete();
        game.cancel();
      });
    }

    // ==============================================================
    // SCENES: instructions
    let instructionsScenes: Array<Scene>;

    switch (game.getParameter("instruction_type")) {
      case "short": {
        instructionsScenes = Instructions.create({
          instructionScenes: [
            {
              title: "Color Shapes",
              text: `Try to remember the location and color of ${numberOfShapesShown} shapes, because they will soon disappear. When the shapes reappear, answer whether they have the SAME or DIFFERENT colors as they had before.`,
              imageName: "instructions-1",
              imageAboveText: false,
              imageMarginTop: 32,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.2,
              nextButtonText: "START",
              nextButtonBackgroundColor: WebColors.Green,
              nextSceneTransition: Transition.none(),
            },
          ],
        });
        break;
      }
      case "long": {
        instructionsScenes = Instructions.create({
          instructionScenes: [
            {
              title: "Color Shapes",
              text: `Try to remember the location and color of ${numberOfShapesShown} shapes, because they will soon disappear.`,
              imageName: "instructions-1",
              imageAboveText: false,
              imageMarginTop: 32,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.2,
            },
            {
              title: "Color Shapes",
              text: "Next you will see the same shapes reappear.",
              imageName: "instructions-2",
              imageAboveText: false,
              imageMarginTop: 32,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.2,
            },
            {
              title: "Color Shapes",
              text: "Answer whether the shapes have the SAME or DIFFERENT colors as they had before.",
              imageName: "instructions-3",
              imageAboveText: false,
              imageMarginTop: 32,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.2,
              nextButtonText: "START",
              nextButtonBackgroundColor: WebColors.Green,
            },
          ],
        });
        break;
      }
      default: {
        throw new Error("invalid value for instruction_type");
      }
    }
    instructionsScenes[0].onAppear(() => {
      // in case user quits before starting a trial, record the
      // timestamp
      game.addTrialData(
        "activity_begin_iso8601_timestamp",
        this.beginIso8601Timestamp,
      );
    });
    game.addScenes(instructionsScenes);

    // ==============================================================
    // SCENE: countdown. Show 3 second countdown.
    const countdownScene = new CountdownScene({
      milliseconds: 3000,
      text: "GET READY!",
      zeroDwellMilliseconds: 1000,
      transition: Transition.none(),
    });
    game.addScene(countdownScene);

    const gridRows = game.getParameter<number>("cells_per_side");
    const gridColumns = game.getParameter<number>("cells_per_side");
    const numberOfTrials = game.getParameter<number>("number_of_trials");
    const shapeColors =
      game.getParameter<Array<{ colorName: string; rgbaColor: RgbaColor }>>(
        "shape_colors",
      );

    interface DisplayShape {
      shape: Shape;
      shapeIndex: number;
      color: RgbaColor;
      colorName: string;
      location: {
        row: number;
        column: number;
      };
    }

    interface TrialConfiguration {
      presentShapes: Array<DisplayShape>;
      responseShapes: Array<DisplayShape>;
      numberOfShapesWithDifferentColors: number;
    }

    const trialConfigurations: Array<TrialConfiguration> = [];
    const rows = game.getParameter<number>("cells_per_side");
    const columns = rows;
    const numberOfDifferentColorsTrials = game.getParameter<number>(
      "number_of_different_colors_trials",
    );
    const differentColorsTrialIndexes = RandomDraws.FromRangeWithoutReplacement(
      numberOfDifferentColorsTrials,
      0,
      numberOfTrials - 1,
    );

    for (let i = 0; i < numberOfTrials; i++) {
      const presentShapes = new Array<DisplayShape>();
      const responseShapes = new Array<DisplayShape>();
      const shapesToShowIndexes = RandomDraws.FromRangeWithoutReplacement(
        numberOfShapesShown,
        0,
        shapeLibrary.length - 1,
      );
      const shapeColorsIndexes = RandomDraws.FromRangeWithoutReplacement(
        numberOfShapesShown,
        0,
        shapeColors.length - 1,
      );

      // do not allow shapes to be in the same row or column
      // or along the diagonal
      const onDiagonal = (
        locations: {
          row: number;
          column: number;
        }[],
      ): boolean => {
        if (
          locations
            .map((c) => c.row === 0 && c.column === 0)
            .some((e) => e === true) &&
          locations
            .map((c) => c.row === 1 && c.column === 1)
            .some((e) => e === true) &&
          locations
            .map((c) => c.row === 2 && c.column === 2)
            .some((e) => e === true)
        ) {
          return true;
        }
        if (
          locations
            .map((c) => c.row === 2 && c.column === 0)
            .some((e) => e === true) &&
          locations
            .map((c) => c.row === 1 && c.column === 1)
            .some((e) => e === true) &&
          locations
            .map((c) => c.row === 0 && c.column === 2)
            .some((e) => e === true)
        ) {
          return true;
        }
        return false;
      };

      const inLine = (
        locations: {
          row: number;
          column: number;
        }[],
      ): boolean => {
        const uniqueRows = new Set(locations.map((l) => l.row)).size;
        const uniqueColumns = new Set(locations.map((l) => l.column)).size;

        if (uniqueRows !== 1 && uniqueColumns !== 1) {
          return false;
        }
        return true;
      };

      // assign present shapes' locations and colors
      let presentLocationsOk = false;
      let presentLocations: {
        row: number;
        column: number;
      }[];
      do {
        presentLocations = RandomDraws.FromGridWithoutReplacement(
          numberOfShapesShown,
          rows,
          columns,
        );

        if (!inLine(presentLocations) && !onDiagonal(presentLocations)) {
          presentLocationsOk = true;
        } else {
          presentLocationsOk = false;
        }
      } while (!presentLocationsOk);
      for (let j = 0; j < numberOfShapesShown; j++) {
        const presentShape: DisplayShape = {
          shape: shapeLibrary[shapesToShowIndexes[j]],
          shapeIndex: shapesToShowIndexes[j],
          color: shapeColors[shapeColorsIndexes[j]].rgbaColor,
          colorName: shapeColors[shapeColorsIndexes[j]].colorName,
          location: presentLocations[j],
        };
        presentShapes.push(presentShape);
      }

      // assign response shapes' locations
      let responseLocationsOk = false;
      let responseLocations: {
        row: number;
        column: number;
      }[];
      do {
        responseLocations = RandomDraws.FromGridWithoutReplacement(
          numberOfShapesShown,
          rows,
          columns,
        );

        if (!inLine(responseLocations) && !onDiagonal(responseLocations)) {
          responseLocationsOk = true;
        } else {
          responseLocationsOk = false;
        }
      } while (!responseLocationsOk);
      for (let j = 0; j < numberOfShapesShown; j++) {
        const responseShape: DisplayShape = {
          shape: presentShapes[j].shape,
          shapeIndex: shapesToShowIndexes[j],
          color: presentShapes[j].color,
          colorName: shapeColors[shapeColorsIndexes[j]].colorName,
          location: responseLocations[j],
        };
        responseShapes.push(responseShape);
      }

      let numberOfShapesWithDifferentColors = 0;
      const differentColorTrial = differentColorsTrialIndexes.includes(i);

      if (differentColorTrial) {
        const numberOfShapesToChange = RandomDraws.SingleFromRange(
          2,
          numberOfShapesShown,
        );
        const shapesToChangeIndexes = RandomDraws.FromRangeWithoutReplacement(
          numberOfShapesToChange,
          0,
          numberOfShapesShown - 1,
        );
        const shapesToChange = shapesToChangeIndexes.map(
          (index) => responseShapes[index],
        );
        numberOfShapesWithDifferentColors = shapesToChange.length;

        /**
         * rotate each shape's color to the next one. The last shape
         * gets the first shape's color
         */
        const firstShapeColor = shapesToChange[0].color;
        for (let j = 0; j < numberOfShapesToChange; j++) {
          const shape = shapesToChange[j];
          if (j + 1 < numberOfShapesToChange) {
            shape.color = shapesToChange[j + 1].color;
          } else {
            shape.color = firstShapeColor;
          }
        }
      }

      trialConfigurations.push({
        presentShapes: presentShapes,
        responseShapes: responseShapes,
        numberOfShapesWithDifferentColors: numberOfShapesWithDifferentColors,
      });
    }

    // ==============================================================
    // SCENE: fixation. Show get ready message, then advance after XXXX
    // milliseconds (as defined in fixation_duration_ms parameter)
    const fixationScene = new Scene();
    game.addScene(fixationScene);

    const fixationSceneSquare = new Shape({
      rect: { size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH } },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Gray,
      lineWidth: 4,
      position: { x: 200, y: 300 },
    });
    fixationScene.addChild(fixationSceneSquare);

    const plusLabel = new Label({
      text: "+",
      fontSize: 32,
      fontColor: WebColors.Black,
    });
    fixationSceneSquare.addChild(plusLabel);

    fixationScene.onAppear(() => {
      game.addTrialData(
        "activity_begin_iso8601_timestamp",
        this.beginIso8601Timestamp,
      );
      game.addTrialData(
        "trial_begin_iso8601_timestamp",
        new Date().toISOString(),
      );
      fixationScene.run(
        Action.sequence([
          Action.wait({ duration: game.getParameter("fixation_duration_ms") }),
          Action.custom({
            callback: () => {
              game.presentScene(shapePresentationScene);
            },
          }),
        ]),
      );
    });

    // ==============================================================
    // SCENE: Shape Presentation.
    const shapePresentationScene = new Scene();
    game.addScene(shapePresentationScene);

    const presentationSceneSquare = new Shape({
      rect: { size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH } },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Gray,
      lineWidth: 4,
      position: { x: 200, y: 300 },
    });
    shapePresentationScene.addChild(presentationSceneSquare);

    const presentationGrid = new Grid({
      rows: gridRows,
      columns: gridColumns,
      size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH },
      position: { x: 200, y: 300 },
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });
    shapePresentationScene.addChild(presentationGrid);

    shapePresentationScene.onAppear(() => {
      const trialConfiguration = trialConfigurations[game.trialIndex];
      for (let i = 0; i < trialConfiguration.presentShapes.length; i++) {
        const presentShape = trialConfiguration.presentShapes[i].shape;
        presentShape.fillColor = trialConfiguration.presentShapes[i].color;
        /**
         * Because we are repositioning children of a grid, we need to
         * set its position back to zero, because in the grid, it recalculates
         * the position. If we don't do this, the shapes will be positioned
         * incorrectly if they are positioned a second time.
         */
        presentShape.position = { x: 0, y: 0 };
        presentationGrid.addAtCell(
          presentShape,
          trialConfiguration.presentShapes[i].location.row,
          trialConfiguration.presentShapes[i].location.column,
        );
      }
      shapePresentationScene.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("shapes_presented_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              presentationGrid.removeAllChildren();
            },
          }),
          Action.wait({
            duration: game.getParameter("shapes_removed_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              presentationGrid.removeAllChildren();
              game.presentScene(shapeResponseScene);
            },
          }),
        ]),
      );
    });

    // ==============================================================
    // SCENE: Shape Response.
    const shapeResponseScene = new Scene();
    game.addScene(shapeResponseScene);

    const responseSceneSquare = new Shape({
      rect: { size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH } },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Gray,
      lineWidth: 4,
      position: { x: 200, y: 300 },
    });
    shapeResponseScene.addChild(responseSceneSquare);

    const responseGrid = new Grid({
      rows: gridRows,
      columns: gridColumns,
      size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH },
      position: { x: 200, y: 300 },
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });
    shapeResponseScene.addChild(responseGrid);

    shapeResponseScene.onAppear(() => {
      const trialConfiguration = trialConfigurations[game.trialIndex];
      for (let i = 0; i < trialConfiguration.responseShapes.length; i++) {
        const responseShape = trialConfiguration.responseShapes[i].shape;
        responseShape.fillColor = trialConfiguration.responseShapes[i].color;
        /**
         * Because we are repositioning children of a grid, we need to
         * set its position back to zero, because in the grid, it recalculates
         * the position. If we don't do this, the shapes will be positioned
         * incorrectly if they are positioned a second time.
         */
        responseShape.position = { x: 0, y: 0 };
        responseGrid.addAtCell(
          responseShape,
          trialConfiguration.responseShapes[i].location.row,
          trialConfiguration.responseShapes[i].location.column,
        );
      }
      sameButton.isUserInteractionEnabled = true;
      differentButton.isUserInteractionEnabled = true;
      Timer.startNew("rt");
    });

    const sameButton = new Button({
      text: "Same",
      position: { x: 100, y: 700 },
      size: { width: 125, height: 50 },
    });
    shapeResponseScene.addChild(sameButton);
    sameButton.onTapDown(() => {
      sameButton.isUserInteractionEnabled = false;
      handleSelection(false);
    });

    const differentButton = new Button({
      text: "Different",
      position: { x: 300, y: 700 },
      size: { width: 125, height: 50 },
    });
    shapeResponseScene.addChild(differentButton);
    differentButton.onTapDown(() => {
      differentButton.isUserInteractionEnabled = false;
      handleSelection(true);
    });

    const handleSelection = (differentPressed: boolean) => {
      const rt = Timer.elapsed("rt");
      Timer.remove("rt");
      responseGrid.removeAllChildren();

      game.addTrialData(
        "trial_end_iso8601_timestamp",
        new Date().toISOString(),
      );
      const trialConfiguration = trialConfigurations[game.trialIndex];
      game.addTrialData("response_time_duration_ms", rt);
      game.addTrialData(
        "number_of_different_shapes",
        trialConfiguration.numberOfShapesWithDifferentColors,
      );
      game.addTrialData(
        "user_response",
        differentPressed ? "different" : "same",
      );
      const correctResponse =
        (trialConfiguration.numberOfShapesWithDifferentColors === 0 &&
          !differentPressed) ||
        (trialConfiguration.numberOfShapesWithDifferentColors > 0 &&
          differentPressed);
      game.addTrialData("user_response_correct", correctResponse);

      const presentShapes = trialConfiguration.presentShapes.map((p) => {
        return {
          shape_index: p.shapeIndex,
          color_name: p.colorName,
          rgba_color: p.color,
          location: p.location,
        };
      });
      game.addTrialData("present_shapes", presentShapes);
      game.addTrialData("quit_button_pressed", false);

      const responseShapes = trialConfiguration.responseShapes.map((p) => {
        return {
          shape_index: p.shapeIndex,
          color_name: p.colorName,
          rgba_color: p.color,
          location: p.location,
        };
      });
      game.addTrialData("response_shapes", responseShapes);
      game.addTrialData("trial_index", game.trialIndex);

      game.trialComplete();
      if (game.trialIndex < numberOfTrials) {
        game.presentScene(fixationScene);
      } else {
        game.presentScene(
          doneScene,
          Transition.slide({
            direction: TransitionDirection.Left,
            duration: 500,
            easing: Easings.sinusoidalInOut,
          }),
        );
      }
    };

    // ==============================================================
    // SCENE: done. Show done message, with a button to exit.
    const doneScene = new Scene();
    game.addScene(doneScene);

    const doneSceneText = new Label({
      text: game.getParameter("trials_complete_scene_text"),
      position: { x: 200, y: 400 },
    });
    doneScene.addChild(doneSceneText);

    const okButton = new Button({
      text: game.getParameter("trials_complete_scene_button_text"),
      position: { x: 200, y: 650 },
    });
    okButton.isUserInteractionEnabled = true;
    okButton.onTapDown(() => {
      // don't allow repeat taps of ok button
      okButton.isUserInteractionEnabled = false;
      doneScene.removeAllChildren();
      game.end();
    });
    doneScene.addChild(okButton);
    doneScene.onSetup(() => {
      // no need to have cancel button, because we're done
      game.removeAllFreeNodes();
    });
  }

  private makeShapes(svgHeight: number) {
    const shape01 = new Shape({
      path: {
        pathString: shapePathStrings[0],
        height: svgHeight,
      },
      lineWidth: 0,
    });

    const shape02 = new Shape({
      path: {
        pathString: shapePathStrings[1],
        height: svgHeight,
      },
      lineWidth: 0,
    });

    // note: shape03 is purposively smaller (.8 height of other shapes)
    const shape03 = new Shape({
      path: {
        pathString: shapePathStrings[2],
        height: svgHeight * 0.8,
      },
      lineWidth: 0,
    });

    const shape04 = new Shape({
      path: {
        pathString: shapePathStrings[3],
        height: svgHeight,
      },
      lineWidth: 0,
    });

    // note: shape05 is purposively smaller (.8 height of other shapes)
    const shape05 = new Shape({
      path: {
        pathString: shapePathStrings[4],
        height: svgHeight * 0.8,
      },
      lineWidth: 0,
    });

    const shape06 = new Shape({
      path: {
        pathString: shapePathStrings[5],
        height: svgHeight,
      },
      lineWidth: 0,
    });

    const shape07 = new Shape({
      path: {
        pathString: shapePathStrings[6],
        height: svgHeight,
      },
      lineWidth: 0,
    });

    const shape08 = new Shape({
      path: {
        pathString: shapePathStrings[7],
        height: svgHeight,
      },
      lineWidth: 0,
    });

    const shapes = [
      shape01,
      shape02,
      shape03,
      shape04,
      shape05,
      shape06,
      shape07,
      shape08,
    ];
    return shapes;
  }
}

const shapePathStrings = [
  "M0 89.94v-2L131.95 0h2v88.7c2.34 1.6 4.47 3.11 6.65 4.55 42.77 28.22 85.54 56.42 128.3 84.63v2c-44.65 29.65-89.3 59.29-133.95 88.94h-1v-90.84C89.44 148.72 44.72 119.33 0 89.94Z",
  "M162 188c-.33 27-.67 54-1 81-26.87-26.18-53.74-52.35-80-77.94V269H0C0 180.83 0 92.67.04 4.5.04 3 .67 1.5 1 0c24.64 29.1 49.15 58.31 73.96 87.26 28.88 33.7 58.01 67.17 87.04 100.74Z",
  "M3 148.86V61.12C41.76 40.75 80.52 20.37 119.28 0h2.91c21.32 20.7 42.64 41.4 63.96 62.11v89.71c-38.44 20.04-76.88 40.09-115.31 60.13h-2.91L3.01 148.86Z",
  "M134 0h2c7.26 22.31 14.38 44.67 21.86 66.9 3.91 11.61 5.47 29.91 13.25 33.27C203 113.94 236.86 123.13 270 134v1L136 269h-1c-11.04-33.58-22.08-67.16-33.21-101.03C67.87 156.98 33.93 145.99 0 135v-1L134 0Z",
  "M107 0h1l108 108v1c-26.67 35.33-53.33 70.66-80 106h-1c-8.82-35.03-17.64-70.07-27-107.28C98.62 145.01 89.81 180 81.01 215h-1C53.33 179.66 26.67 144.33 0 109v-2L107 0Z",
  "M0 1C2.17.67 4.33.05 6.5.04 58.33-.01 110.17 0 162 0v270H2c26.2-22.17 52.41-44.33 78.86-66.71V67.4c-3.85-3.22-7.35-6.2-10.9-9.11C46.64 39.18 23.32 20.09 0 1Z",
  "M95 268.99h-1C62.66 238.66 31.33 208.33 0 178V88C26.67 58.67 53.33 29.33 80 0h1c0 29.45 0 58.89-.01 88.38 35.99 29.57 72 59.09 108.01 88.61v1l-94 91Z",
  "M13 0h67l135 135v1L81 270c-27-.33-54-.67-81-1 11.73-12.51 23.61-24.87 35.16-37.54 33.14-36.35 66.14-72.82 100.23-110.38C94.4 80.52 53.7 40.26 13 0Z",
];

export { ColorShapes };
