import {
  Game,
  Action,
  Scene,
  Shape,
  Label,
  TextLine,
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
  Equals,
  Sprite,
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class ColorDots extends Game {
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
      dot_colors: {
        type: "array",
        description: "Array of colors for dots.",
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
          // These two additional colors were in the original specification
          // but not implemented: [230, 159, 0, 1], [86, 180, 233, 1]
        ],
      },
      dot_diameter: {
        default: 48,
        description: "Diameter of dots.",
        type: "number",
      },
      number_of_dots: {
        default: 3,
        description: "How many dots to present. Must be at least 3.",
        type: "integer",
      },
      dot_present_duration_ms: {
        default: 1000,
        description: "How long the dots are shown, milliseconds.",
        type: "number",
      },
      dot_blank_duration_ms: {
        default: 750,
        description:
          "How long to show a blank square after dots are removed, milliseconds.",
        type: "number",
      },
      color_selected_hold_duration_ms: {
        default: 500,
        description:
          "How long to show a square with the dot colored by the user's choice, before advancing to next scene, milliseconds.",
        type: "number",
      },
      number_of_trials: {
        default: 5,
        description: "How many trials to run.",
        type: "integer",
      },
      trials_complete_scene_text: {
        default: "You have completed all the color dots trials",
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
        description: "Type of intructions to show, 'short' or 'long'.",
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
    const colorDotsTrialSchema: TrialSchema = {
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
      trial_index: {
        type: ["integer", "null"],
        description: "Index of the trial within this assessment, 0-based.",
      },
      square_side_length: {
        type: ["number", "null"],
        description:
          "Length of square side, in pixels. This is the square in which the dots are shown. Null if trial was skipped.",
      },
      presented_dots: {
        description:
          "Configuration of dots presented to the user. Null if trial was skipped.",
        type: ["array", "null"],
        items: {
          type: "object",
          properties: {
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
              description: "Location of dot.",
              properties: {
                x: {
                  type: "number",
                  description: "X coordinate of dot.",
                },
                y: {
                  type: "number",
                  description: "Y coordinate of dot.",
                },
              },
            },
          },
        },
      },
      color_target_dot_index: {
        description:
          "Index (0-based) of presented dot whose color the user was asked to recall. Null if trial was skipped.",
        type: ["integer", "null"],
      },
      color_selected: {
        description: "Color selected by user. Null if trial was skipped.",
        type: ["object", "null"],
        properties: {
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
        },
      },
      color_selected_correct: {
        type: ["boolean", "null"],
        description:
          "Was the color selected by the user correct? Null if trial was skipped.",
      },
      location_target_dot_index: {
        description:
          "Index (0-based) of presented dot whose location the user was asked to recall. Null if trial was skipped.",
        type: ["integer", "null"],
      },
      location_selected: {
        description: "Location selected by user. Null if trial was skipped.",
        type: ["object", "null"],
        properties: {
          x: {
            type: "number",
            description: "X coordinate of dot.",
          },
          y: {
            type: "number",
            description: "Y coordinate of dot.",
          },
        },
      },
      location_selected_delta: {
        type: ["number", "null"],
        description:
          "Euclidean distance between location target dot and the location selected by user. Null if trial was skipped.",
      },
      color_selection_response_time_ms: {
        type: ["number", "null"],
        description:
          "Milliseconds from the beginning of color selection task until the user taps the done button. Null if trial was skipped.",
      },
      location_selection_response_time_ms: {
        type: ["number", "null"],
        description:
          "Milliseconds from the beginning of location selection task until the user taps the done button. Null if trial was skipped.",
      },
      quit_button_pressed: {
        type: "boolean",
        description: "Was the quit button pressed?",
      },
    };

    const options: GameOptions = {
      name: "Color Dots",
      id: "color-dots",
      version: "0.8.0",
      shortDescription: "A short description of Color Dots goes here...",
      longDescription:
        "Participants are asked to remember the location and color of three \
briefly presented, and uniquely colored dots. Each trial of this task \
requires two responses (subsequently referred to as stage 1 and stage 2 in \
the list of outcome variables): (1) reporting the color at a cued location; \
(2) reporting the location where a circular of a specified color previously \
appeared.",
      showFps: defaultParameters.show_fps.default,
      width: 400,
      height: 800,
      bodyBackgroundColor: WebColors.White,
      trialSchema: colorDotsTrialSchema,
      parameters: defaultParameters,
      fontUrls: ["assets/color-dots/fonts/roboto/Roboto-Regular.ttf"],
      images: [
        {
          name: "cd1",
          height: 250,
          width: 250,
          url: "assets/color-dots/img/cd1.png",
        },
        {
          name: "cd2",
          height: 357,
          width: 250,
          url: "assets/color-dots/img/cd2.png",
        },
        {
          name: "cd3",
          height: 345,
          width: 250,
          url: "assets/color-dots/img/cd3.png",
        },
        {
          name: "circle-x",
          height: 32,
          width: 32,
          // the svg is from evericons and is licensed under CC0 1.0
          // Universal (Public Domain). see https://www.patreon.com/evericons
          url: "assets/color-dots/img/circle-x.svg",
        },
      ],
    };

    super(options);
  }

  init(): void {
    // just for convenience, alias the variable game to "this"
    // (even though eslint doesn't like it)
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    const SQUARE_SIDE_LENGTH = 350;

    // ==============================================================

    if (game.getParameter<boolean>("show_quit_button")) {
      const quitSprite = new Sprite({
        imageName: "circle-x",
        position: { x: 380, y: 20 },
        isUserInteractionEnabled: true,
      });
      game.addFreeEntity(quitSprite);
      quitSprite.onTapDown((e) => {
        game.removeAllFreeEntities();
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
    // These user input variables are referenced across scenes, thus
    // we must define them in this scope, rather than in the
    // scene.onSetup() function.
    interface ColorSelected {
      color_name: string;
      rgba_color: RgbaColor;
    }
    let colorSelected: ColorSelected;
    let selectedRgba: RgbaColor | undefined;

    // ==============================================================
    // SCENES: instructions
    let instructionsScenes: Array<Scene>;

    switch (game.getParameter("instruction_type")) {
      case "short": {
        instructionsScenes = Instructions.Create({
          instructionScenes: [
            {
              title: "Color Dots",
              text: "For this activity, try to remember the location and color of 3 dots.",
              image: "cd1",
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
        instructionsScenes = Instructions.Create({
          instructionScenes: [
            {
              title: "Color Dots",
              text: "For this activity, try to remember the location and color of 3 dots.",
              image: "cd1",
              imageAboveText: false,
              imageMarginTop: 32,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.2,
            },
            {
              title: "Color Dots",
              text: "Choose the color of the dot from the options at the bottom of the screen.",
              image: "cd2",
              imageAboveText: false,
              imageMarginTop: 32,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.2,
            },
            {
              title: "Color Dots",
              text: "Next you are asked to place another dot. Touch the screen where you remember seeing the dot.",
              image: "cd3",
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
      default: {
        throw new Error("invalid value for instruction_type");
      }
    }
    instructionsScenes[0].onAppear(() => {
      // in case user quits before starting a trial, record the
      // timestamp
      game.addTrialData(
        "activity_begin_iso8601_timestamp",
        this.beginIso8601Timestamp
      );
    });
    game.addScenes(instructionsScenes);

    interface Dot {
      x: number;
      y: number;
      rgbaColor: RgbaColor;
      colorName: string;
    }

    interface ScreenDot extends Dot {
      shape: Shape;
    }

    interface TrialConfiguration {
      dots: Array<Dot>;
      colorSelectionDotIndex: number;
      locationSelectionDotIndex: number;
    }

    const trialConfigurations: Array<TrialConfiguration> = [];
    const numberOfDots = game.getParameter<number>("number_of_dots");
    const dotColors =
      game.getParameter<Array<{ colorName: string; rgbaColor: RgbaColor }>>(
        "dot_colors"
      );
    const dotDiameter = game.getParameter<number>("dot_diameter");
    const numberOfColors = dotColors.length;

    function positionTooCloseToOtherDots(
      x: number,
      y: number,
      dots: Array<Dot>
    ) {
      for (let i = 0; i < dots.length; i++) {
        const dist = Math.sqrt(
          Math.pow(x - dots[i].x, 2) + Math.pow(y - dots[i].y, 2)
        );
        if (dist < dotDiameter * 3 + 0.25 * dotDiameter) {
          return true;
        }
      }
      return false;
    }

    for (let i = 0; i < game.getParameter<number>("number_of_trials"); i++) {
      // we clone the dotColors array because we mutate the cloned array
      // (availableColors) to avoid re-using colors in the same trial
      const availableColors: { colorName: string; rgbaColor: RgbaColor }[] =
        JSON.parse(JSON.stringify(dotColors));
      const dots = new Array<Dot>();
      for (let j = 0; j < numberOfDots; j++) {
        let x: number;
        let y: number;
        do {
          // +4, -4 to have some small margin between dot and square
          x = RandomDraws.SingleFromRange(
            0 + dotDiameter / 2 + 4,
            SQUARE_SIDE_LENGTH - dotDiameter / 2 - 4
          );
          y = RandomDraws.SingleFromRange(
            0 + dotDiameter / 2 + 4,
            SQUARE_SIDE_LENGTH - dotDiameter / 2 - 4
          );
        } while (positionTooCloseToOtherDots(x, y, dots));

        const colorIndex = RandomDraws.SingleFromRange(
          0,
          availableColors.length - 1
        );
        const dotColor = availableColors.splice(colorIndex, 1)[0];
        const dot = {
          x,
          y,
          rgbaColor: dotColor.rgbaColor,
          colorName: dotColor.colorName,
        };
        dots.push(dot);
      }

      const colorSelectionDotIndex = RandomDraws.SingleFromRange(
        0,
        dots.length - 1
      );

      trialConfigurations.push({
        colorSelectionDotIndex: colorSelectionDotIndex,
        // which dot is chosen for the location selection task is not yet
        // known, because it depends on user input to color selection task.
        locationSelectionDotIndex: NaN,
        dots: dots,
      });
    }

    // ==============================================================
    // SCENE: fixation. Show get ready message, then advance after XXXX
    // milliseconds (as defined in fixation_duration_ms parameter)
    const fixationScene = new Scene();
    game.addScene(fixationScene);

    const readyLabel = new Label({
      text: "Ready",
      fontSize: 24,
      position: { x: 200, y: 60 },
    });
    fixationScene.addChild(readyLabel);

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

    fixationScene.onSetup(() => {
      fixationScene.run(
        Action.sequence([
          Action.wait({ duration: game.getParameter("fixation_duration_ms") }),
          Action.custom({
            callback: () => {
              game.presentScene(dotPresentationScene);
            },
          }),
        ])
      );
    });

    fixationScene.onAppear(() => {
      game.addTrialData(
        "activity_begin_iso8601_timestamp",
        this.beginIso8601Timestamp
      );
      game.addTrialData(
        "trial_begin_iso8601_timestamp",
        new Date().toISOString()
      );
    });

    // ==============================================================
    // SCENE: dotPresentation.
    const dotPresentationScene = new Scene();
    game.addScene(dotPresentationScene);

    const dotPresentationSceneSquare = new Shape({
      rect: { size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH } },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Gray,
      lineWidth: 4,
      position: { x: 200, y: 300 },
    });
    dotPresentationScene.addChild(dotPresentationSceneSquare);

    const screenDots = new Array<ScreenDot>();

    dotPresentationScene.onSetup(() => {
      screenDots.length = 0;
      const trialConfiguration = trialConfigurations[game.trialIndex];

      for (const dot of trialConfiguration.dots) {
        const screenDot: ScreenDot = {
          x: dot.x,
          y: dot.y,
          rgbaColor: dot.rgbaColor,
          colorName: dot.colorName,
          shape: new Shape({
            circleOfRadius: dotDiameter / 2,
            fillColor: dot.rgbaColor,
            position: {
              x: dot.x - SQUARE_SIDE_LENGTH / 2,
              y: dot.y - SQUARE_SIDE_LENGTH / 2,
            },
          }),
        };
        screenDots.push(screenDot);
        dotPresentationSceneSquare.addChild(screenDot.shape);
      }

      dotPresentationScene.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("dot_present_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              dotPresentationSceneSquare.removeAllChildren();
            },
          }),
          Action.wait({ duration: game.getParameter("dot_blank_duration_ms") }),
          Action.custom({
            callback: () => {
              game.presentScene(colorSelectionScene);
            },
          }),
        ])
      );
    });

    // ==============================================================
    // SCENE: colorSelection
    const colorSelectionScene = new Scene();
    game.addScene(colorSelectionScene);

    const colorSelectionSceneSquare = new Shape({
      rect: { size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH } },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Gray,
      lineWidth: 4,
      position: { x: 200, y: 300 },
    });
    colorSelectionScene.addChild(colorSelectionSceneSquare);

    const whatColorLabel = new Label({
      text: "What color was this dot?",
      fontSize: 24,
      position: { x: 200, y: 60 },
    });
    colorSelectionScene.addChild(whatColorLabel);

    const colorPaletteOutline = new Shape({
      position: { x: 200, y: 530 },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Black,
      lineWidth: 2,
      rect: { width: 350, height: 60 },
    });
    colorSelectionScene.addChild(colorPaletteOutline);

    const colorPaletteGrid = new Grid({
      position: { x: 200, y: 530 },
      rows: 1,
      columns: numberOfColors,
      size: { width: 350, height: 60 },
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });

    colorSelectionScene.addChild(colorPaletteGrid);

    let colorRt = -1;

    const colorSelectionDoneButton = new Button({
      position: { x: 200, y: 650 },
      text: "Done",
      hidden: true,
    });
    colorSelectionDoneButton.onTapDown(() => {
      Timer.stop("colorRt");
      colorRt = Timer.elapsed("colorRt");
      Timer.remove("colorRt");
      game.addTrialData("color_selection_response_time_ms", colorRt);
      whatColorLabel.hidden = true;
      colorPaletteOutline.hidden = true;
      colorPaletteGrid.hidden = true;
      colorSelectionDoneButton.hidden = true;
      colorSelectionDoneButton.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("color_selected_hold_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              if (!selectedRgba) {
                throw new Error("no selected color");
              }
              const colorSelectedName = dotColors.filter((d) =>
                Equals.rgbaColor(d.rgbaColor, selectedRgba)
              )[0].colorName;
              colorSelected = {
                color_name: colorSelectedName,
                rgba_color: selectedRgba,
              };
              game.addTrialData("color_selected", colorSelected);
              const trialConfiguration = trialConfigurations[game.trialIndex];
              const colorTargetDot =
                trialConfiguration.dots[
                  trialConfiguration.colorSelectionDotIndex
                ];
              game.addTrialData(
                "color_selected_correct",
                Equals.rgbaColor(colorTargetDot.rgbaColor, selectedRgba)
              );
              game.presentScene(locationSelectionScene);
            },
          }),
        ])
      );
    });

    colorSelectionScene.addChild(colorSelectionDoneButton);

    colorSelectionScene.onSetup(() => {
      whatColorLabel.hidden = false;
      colorPaletteOutline.hidden = false;
      colorPaletteGrid.hidden = false;
      colorSelectionSceneSquare.removeAllChildren();

      const trialConfiguration = trialConfigurations[game.trialIndex];
      const colorSelectionDotIndex = trialConfiguration.colorSelectionDotIndex;

      const colorSelectionDot =
        screenDots[colorSelectionDotIndex].shape.duplicate();
      colorSelectionDot.fillColor = WebColors.Transparent;
      colorSelectionDot.strokeColor = WebColors.Black;
      colorSelectionDot.lineWidth = 2;

      colorSelectionSceneSquare.addChild(colorSelectionDot);

      colorPaletteGrid.removeAllChildren();
      for (let i = 0; i < numberOfColors; i++) {
        const colorDot = new Shape({
          circleOfRadius: dotDiameter / 2,
          fillColor: dotColors[i].rgbaColor,
          isUserInteractionEnabled: true,
        });
        colorDot.size = { width: dotDiameter, height: dotDiameter };

        colorDot.onTapDown(() => {
          colorSelectionDot.fillColor = colorDot.fillColor;
          colorSelectionDoneButton.hidden = false;
          colorSelectionDoneButton.isUserInteractionEnabled = true;
          selectedRgba = colorDot.fillColor;
        });

        colorPaletteGrid.addAtCell(colorDot, 0, i);
      }
    });

    colorSelectionScene.onAppear(() => {
      Timer.start("colorRt");
    });

    // ==============================================================
    // SCENE: locationSelection

    const locationSelectionScene = new Scene();
    game.addScene(locationSelectionScene);

    const locationSelectionSquare = new Shape({
      rect: { size: { width: SQUARE_SIDE_LENGTH, height: SQUARE_SIDE_LENGTH } },
      fillColor: WebColors.Transparent,
      strokeColor: WebColors.Gray,
      lineWidth: 4,
      position: { x: 200, y: 300 },
    });
    locationSelectionScene.addChild(locationSelectionSquare);

    const whereDotText = new TextLine({
      text: "Where was this dot?",
      fontSize: 24,
      position: { x: 50, y: 60 },
    });
    locationSelectionScene.addChild(whereDotText);

    const touchToMoveLabel = new Label({
      text: "Touch the screen to move the dot",
      fontSize: 24,
      position: { x: 200, y: 530 },
    });
    locationSelectionSquare.addChild(touchToMoveLabel);

    let locationSelectionDot: Shape;
    let location_target: {
      x: number;
      y: number;
      color_name: string;
      color_rgba: RgbaColor;
    };

    locationSelectionScene.onSetup(() => {
      const trialConfiguration = trialConfigurations[game.trialIndex];
      const colorSelectionDotIndex = trialConfiguration.colorSelectionDotIndex;

      locationSelectionDoneButton.hidden = true;
      locationSelectionSquare.removeAllChildren();

      const priorColorSelectedDot = new Shape({
        circleOfRadius: dotDiameter / 2,
        fillColor: selectedRgba,
        strokeColor: WebColors.Black,
        lineWidth: 2,
        position: {
          x:
            trialConfiguration.dots[colorSelectionDotIndex].x -
            SQUARE_SIDE_LENGTH / 2,
          y:
            trialConfiguration.dots[colorSelectionDotIndex].y -
            SQUARE_SIDE_LENGTH / 2,
        },
      });
      locationSelectionSquare.addChild(priorColorSelectedDot);

      let locationSelectionDotIndex = -1;
      do {
        locationSelectionDotIndex = RandomDraws.SingleFromRange(
          0,
          numberOfDots - 1
        );
        if (
          Equals.rgbaColor(
            trialConfiguration.dots[locationSelectionDotIndex].rgbaColor,
            selectedRgba
          )
        ) {
          locationSelectionDotIndex = -1;
        }
        if (locationSelectionDotIndex === colorSelectionDotIndex) {
          locationSelectionDotIndex = -1;
        }
      } while (locationSelectionDotIndex === -1);

      trialConfiguration.locationSelectionDotIndex = locationSelectionDotIndex;

      locationSelectionDot = new Shape({
        circleOfRadius: dotDiameter / 2,
        fillColor: trialConfiguration.dots[locationSelectionDotIndex].rgbaColor,
        position: { x: 300, y: 60 },
      });
      locationSelectionScene.addChild(locationSelectionDot);

      location_target = {
        x: trialConfiguration.dots[locationSelectionDotIndex].x,
        y: trialConfiguration.dots[locationSelectionDotIndex].y,
        color_name:
          trialConfiguration.dots[locationSelectionDotIndex].colorName,
        color_rgba:
          trialConfiguration.dots[locationSelectionDotIndex].rgbaColor,
      };

      const presentedDots = [];
      for (let i = 0; i < trialConfiguration.dots.length; i++) {
        const dot = {
          color_name: trialConfiguration.dots[i].colorName,
          rgba_color: trialConfiguration.dots[i].rgbaColor,
          location: {
            x: trialConfiguration.dots[i].x,
            y: trialConfiguration.dots[i].y,
          },
        };
        presentedDots.push(dot);
      }
      game.addTrialData("presented_dots", presentedDots);
      game.addTrialData(
        "color_target_dot_index",
        trialConfiguration.colorSelectionDotIndex
      );
      game.addTrialData(
        "location_target_dot_index",
        trialConfiguration.locationSelectionDotIndex
      );

      if (!selectedRgba) {
        throw new Error("no selected color!");
      }
      priorColorSelectedDot.fillColor = selectedRgba;
      locationSelectionSquare.isUserInteractionEnabled = true;

      locationSelectionSquare.onTapDown((tapEvent) => {
        if (locationSelectionScene.children.includes(locationSelectionDot)) {
          locationSelectionScene.removeChild(locationSelectionDot);
          locationSelectionSquare.addChild(locationSelectionDot);
          locationSelectionDoneButton.hidden = false;
        }
        locationSelectionDot.position = {
          x: tapEvent.point.x - SQUARE_SIDE_LENGTH / 2,
          y: tapEvent.point.y - SQUARE_SIDE_LENGTH / 2,
        };
      });
    });

    locationSelectionScene.onAppear(() => {
      Timer.start("locationRt");
    });

    let locationRt = -1;

    const locationSelectionDoneButton = new Button({
      position: { x: 200, y: 650 },
      text: "Done",
      hidden: true,
      isUserInteractionEnabled: true,
    });
    locationSelectionDoneButton.onTapDown(() => {
      Timer.stop("locationRt");
      locationRt = Timer.elapsed("locationRt");
      Timer.remove("locationRt");
      game.addTrialData("location_selection_response_time_ms", locationRt);

      const location_selected = {
        x: locationSelectionDot.position.x + SQUARE_SIDE_LENGTH / 2,
        y: locationSelectionDot.position.y + SQUARE_SIDE_LENGTH / 2,
      };
      game.addTrialData("location_selected", location_selected);
      game.addTrialData("square_side_length", SQUARE_SIDE_LENGTH);
      const delta = Math.sqrt(
        Math.pow(location_selected.x - location_target.x, 2) +
          Math.pow(location_selected.y - location_target.y, 2)
      );
      game.addTrialData("location_selected_delta", delta);
      game.addTrialData("quit_button_pressed", false);
      game.addTrialData("trial_index", game.trialIndex);
      game.trialComplete();
      if (game.trialIndex < game.getParameter<number>("number_of_trials")) {
        game.presentScene(fixationScene);
      } else {
        game.presentScene(
          doneScene,
          Transition.slide({
            direction: TransitionDirection.left,
            duration: 500,
            easing: Easings.sinusoidalInOut,
          })
        );
      }
    });
    locationSelectionScene.addChild(locationSelectionDoneButton);

    // ==============================================================
    // SCENE: done. Show done messgae, with a button to exit.
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
      game.removeAllFreeEntities();
    });
  }
}

export { ColorDots };
