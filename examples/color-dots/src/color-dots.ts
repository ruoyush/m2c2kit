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
  Session,
  Easings,
  EventBase,
  EventType,
  SessionLifecycleEvent,
  ActivityDataEvent,
  ActivityLifecycleEvent,
  RgbaColor,
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class ColorDots extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * At run time, they can be changed with the setParameters() method.
     */
    const defaultParameters: GameParameters = {
      fixation_duration_ms: {
        value: 500,
        description: "How long fixation scene is shown, milliseconds.",
      },
      dot_colors: {
        value: [
          [0, 0, 0, 1],
          // [230, 159, 0, 1],
          // [86, 180, 233, 1],
          [0, 158, 115, 1],
          [240, 228, 66, 1],
          [0, 114, 178, 1],
          [213, 94, 0, 1],
          [204, 121, 167, 1],
        ],
        description:
          "Array of colors for dots. Each color is itself an array, [r,g,b,a]",
      },
      dot_diameter: {
        value: 48,
        description: "Diameter of dots.",
      },
      number_of_dots: {
        value: 3,
        description: "How many dots to present. Must be at least 3.",
      },
      dot_present_duration_ms: {
        value: 1000,
        description: "How long the dots are shown, milliseconds.",
      },
      dot_blank_duration_ms: {
        value: 750,
        description:
          "How long to show a blank square after dots are removed, milliseconds.",
      },
      color_selected_hold_duration_ms: {
        value: 500,
        description:
          "How long to show a square with the dot colored by the user's choice, before advancing to next scene, milliseconds.",
      },
      number_of_trials: {
        value: 5,
        description: "How many trials to run.",
      },
      trials_complete_scene_text: {
        value: "You have completed all the color dots trials",
        description: "Text for scene displayed after all trials are complete.",
      },
      trials_complete_scene_button_text: {
        value: "OK",
        description:
          "Button text for scene displayed after all trials are complete.",
      },
      instruction_type: {
        value: "long",
        description: "Type of intructions to show, 'short' or 'long'.",
      },
    };

    /**
     * This describes all the data that will be generated by the assessment.
     * At runtime, when a trial completes, the data will be returned to the
     * session with a callback, along with this schema transformed into
     * JSON Schema Draft-07 format.
     */
    const colorDotsTrialSchema: TrialSchema = {
      color_selection_response_time_ms: {
        type: "number",
        description:
          "milliseconds from the beginning of color selection task until the user taps the done button",
      },
      location_selection_response_time_ms: {
        type: "number",
        description:
          "milliseconds from the beginning of location selection task until the user taps the done button",
      },
    };

    const options: GameOptions = {
      name: "Color Dots",
      version: "0.0.1",
      shortDescription: "A short description of Grid Memory goes here...",
      longDescription:
        "Participants are asked to remember the location and color of three \
briefly presented, and uniquely colored dots. Each trial of this task \
requires two responses (subsequently referred to as stage 1 and stage 2 in \
the list of outcome variables): (1) reporting the color at a cued location; \
(2) reporting the location where a circular of a specified color previously \
appeared.",
      showFps: true,
      width: 400,
      height: 800,
      bodyBackgroundColor: WebColors.AntiqueWhite,
      trialSchema: colorDotsTrialSchema,
      parameters: defaultParameters,
      fontUrls: ["./fonts/roboto/Roboto-Regular.ttf"],
      images: [
        {
          name: "cd1",
          height: 250,
          width: 250,
          url: "img/cd1.png",
        },
        {
          name: "cd2",
          height: 357,
          width: 250,
          url: "img/cd2.png",
        },
        {
          name: "cd3",
          height: 345,
          width: 250,
          url: "img/cd3.png",
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

    // ==============================================================
    // SCENES: instructions
    let instructionsScenes: Array<Scene>;

    switch (game.getParameter("instruction_type")) {
      case "short": {
        instructionsScenes = Instructions.Create({
          sceneNamePrefix: "instructions",
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
          postInstructionsScene: "fixationScene",
        });
        break;
      }
      case "long": {
        instructionsScenes = Instructions.Create({
          sceneNamePrefix: "instructions",
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
          postInstructionsScene: "fixationScene",
        });
        break;
      }
      default: {
        throw new Error("invalid value for instruction_type");
      }
    }
    game.addScenes(instructionsScenes);
    game.entryScene = "instructions-01";

    interface Dot {
      x: number;
      y: number;
      color: RgbaColor;
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

    const squareSide = 350;
    const numberOfDots = game.getParameter<number>("number_of_dots");
    const dotColors: Array<RgbaColor> = game.getParameter("dot_colors");
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
      const availableColors: Array<RgbaColor> = JSON.parse(
        JSON.stringify(dotColors)
      );
      const dots = new Array<Dot>();
      for (let j = 0; j < numberOfDots; j++) {
        let x: number;
        let y: number;
        do {
          x = RandomDraws.SingleFromRange(
            0 + dotDiameter / 2 + 4,
            squareSide - dotDiameter / 2 - 4
          );
          y = RandomDraws.SingleFromRange(
            0 + dotDiameter / 2 + 4,
            squareSide - dotDiameter / 2 - 4
          );
        } while (positionTooCloseToOtherDots(x, y, dots));

        const colorIndex = RandomDraws.SingleFromRange(
          0,
          availableColors.length - 1
        );
        const color = availableColors.splice(colorIndex, 1)[0];
        const dot = { x, y, color };
        dots.push(dot);
      }

      const colorSelectionDotIndex = RandomDraws.SingleFromRange(
        0,
        dots.length - 1
      );

      trialConfigurations.push({
        colorSelectionDotIndex: colorSelectionDotIndex,
        locationSelectionDotIndex: NaN,
        dots: dots,
      });
    }

    // ==============================================================
    // SCENE: fixation. Show get ready message, then advance after XXXX
    // milliseconds (as defined in fixation_duration_ms parameter)
    const fixationScene = new Scene({
      name: "fixationScene",
    });
    game.addScene(fixationScene);

    const readyLabel = new Label({
      text: "Ready",
      fontSize: 24,
      position: { x: 200, y: 60 },
    });
    fixationScene.addChild(readyLabel);

    const fixationSceneSquare = new Shape({
      rect: { size: { width: squareSide, height: squareSide } },
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

    // ==============================================================
    // SCENE: dotPresentation.
    const dotPresentationScene = new Scene();
    game.addScene(dotPresentationScene);

    const dotPresentationSceneSquare = new Shape({
      rect: { size: { width: squareSide, height: squareSide } },
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
          color: dot.color,
          shape: new Shape({
            circleOfRadius: dotDiameter / 2,
            fillColor: dot.color,
            position: { x: dot.x - squareSide / 2, y: dot.y - squareSide / 2 },
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
      rect: { size: { width: squareSide, height: squareSide } },
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
              game.presentScene(locationSelectionScene);
            },
          }),
        ])
      );
    });

    colorSelectionScene.addChild(colorSelectionDoneButton);

    let selectedColor: RgbaColor | undefined;

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
          fillColor: dotColors[i],
          isUserInteractionEnabled: true,
        });
        colorDot.size = { width: dotDiameter, height: dotDiameter };

        colorDot.onTapDown(() => {
          colorSelectionDot.fillColor = colorDot.fillColor;
          colorSelectionDoneButton.hidden = false;
          colorSelectionDoneButton.isUserInteractionEnabled = true;
          selectedColor = colorDot.fillColor;
        });

        colorPaletteGrid.addAtCell(colorDot, 0, i);
      }
      Timer.start("colorRt");
    });

    // // ==============================================================
    // // SCENE: locationSelection

    const locationSelectionScene = new Scene();
    game.addScene(locationSelectionScene);

    const locationSelectionSquare = new Shape({
      rect: { size: { width: squareSide, height: squareSide } },
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

    locationSelectionScene.onSetup(() => {
      const trialConfiguration = trialConfigurations[game.trialIndex];
      const colorSelectionDotIndex = trialConfiguration.colorSelectionDotIndex;

      locationSelectionDoneButton.hidden = true;
      locationSelectionSquare.removeAllChildren();

      const priorColorSelectedDot = new Shape({
        circleOfRadius: dotDiameter / 2,
        fillColor: selectedColor,
        strokeColor: WebColors.Black,
        lineWidth: 2,
        position: {
          x: trialConfiguration.dots[colorSelectionDotIndex].x - squareSide / 2,
          y: trialConfiguration.dots[colorSelectionDotIndex].y - squareSide / 2,
        },
      });
      locationSelectionSquare.addChild(priorColorSelectedDot);

      let locationSelectionDotIndex = -1;
      do {
        locationSelectionDotIndex = RandomDraws.SingleFromRange(
          0,
          numberOfDots - 1
        );
        // we stringify to compare these as value types
        if (
          JSON.stringify(
            trialConfiguration.dots[locationSelectionDotIndex].color
          ) === JSON.stringify(selectedColor)
        ) {
          locationSelectionDotIndex = -1;
        }
        if (locationSelectionDotIndex === colorSelectionDotIndex) {
          locationSelectionDotIndex = -1;
        }
      } while (locationSelectionDotIndex === -1);

      trialConfiguration.locationSelectionDotIndex = locationSelectionDotIndex;

      const locationSelectionDot = new Shape({
        circleOfRadius: dotDiameter / 2,
        fillColor: trialConfiguration.dots[locationSelectionDotIndex].color,
        position: { x: 300, y: 60 },
      });
      locationSelectionScene.addChild(locationSelectionDot);

      if (!selectedColor) {
        throw new Error("no selected color!");
      }
      priorColorSelectedDot.fillColor = selectedColor;
      locationSelectionSquare.isUserInteractionEnabled = true;

      locationSelectionSquare.onTapDown((tapEvent) => {
        if (locationSelectionScene.children.includes(locationSelectionDot)) {
          locationSelectionScene.removeChild(locationSelectionDot);
          locationSelectionSquare.addChild(locationSelectionDot);
          locationSelectionDoneButton.hidden = false;
        }
        locationSelectionDot.position = {
          x: tapEvent.point.x - squareSide / 2,
          y: tapEvent.point.y - squareSide / 2,
        };
      });

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

    game.entryScene = "instructions-01";
    //game.entryScene = fixationScene;
  }
}

// ===========================================================================
// Below is Android WebView interop. We'll need something similar for iOS.

//#region to support m2c2kit in Android WebView
/**
 * When running within an Android WebView, the below defines how the session
 * can communicate events back to the Android app. Note: names of this Android
 * namespace and its functions must match the corresponding Android code
 * in addJavascriptInterface() and @JavascriptInterface
 * In the Android code you can see that we called the namespace "Android" and it
 * matches our declared namespace here, but it could have been called anything,
 * as long as they match.
 * */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Android {
  function onActivityDataCreate(activityDataEventAsString: string): void;
  function onActivityLifecycleChange(
    activityLifecycleEventAsString: string
  ): void;
  function onSessionLifecycleChange(
    sessionLifecycleEventAsString: string
  ): void;
  /**
   * If the Android native app will control the session execution and be
   * able to set custom game paraemters (which is probably what you want),
   * be sure that sessionManualStart() in the native code returns true
   * */
  function sessionManualStart(): boolean;
}

/**
 * Just a quick conveneience function so we can know if we are running
 * within our custom Android WebView
 */
function contextIsAndroidWebView(): boolean {
  return typeof Android !== "undefined";
}

function sendEventToAndroid(event: EventBase) {
  switch (event.eventType) {
    case EventType.sessionLifecycle: {
      Android.onSessionLifecycleChange(JSON.stringify(event));
      break;
    }
    case EventType.activityData: {
      Android.onActivityDataCreate(JSON.stringify(event));
      break;
    }
    case EventType.activityLifecycle: {
      Android.onActivityLifecycleChange(JSON.stringify(event));
      break;
    }
    default:
      throw new Error(
        `attempt to send unknown event ${event.eventType} to Android`
      );
  }
}
//#endregion

const gridMemory = new ColorDots();
const session = new Session({
  activities: [gridMemory],
  sessionCallbacks: {
    /**
     * onSessionLifecycleChange() will be called on events such
     * as when the session initialization is complete or when it
     * ends.
     *
     * Once initialized, the session will automatically start,
     * unless we're running in an Android WebView AND a manual start
     * is desired.
     */
    onSessionLifecycleChange: (ev: SessionLifecycleEvent) => {
      if (ev.initialized) {
        //#region to support m2c2kit in Android WebView
        if (contextIsAndroidWebView()) {
          sendEventToAndroid(ev);
        }
        if (contextIsAndroidWebView() && Android.sessionManualStart()) {
          // don't automatically start! Let the native Android code
          // set some game parameters and start the game
          return;
        }
        //#endregion
        session.start();
      }
      if (ev.ended) {
        console.log("session ended");
        //#region to support m2c2kit in Android WebView
        if (contextIsAndroidWebView()) {
          sendEventToAndroid(ev);
        }
        //#endregion
      }
    },
  },
  activityCallbacks: {
    /**
     * onActivityDataCreate() is where you insert code to post data to an API
     * or interop with a native function in the host app, if applicable,
     * as we do with sendEventToAndroid()
     *
     * newData is the data that was just generated by the completed trial
     * data is all the data, cumulative of all trials, that have been generated.
     *
     * We separate out newData from data in case you want to alter the execution
     * based on the most recent trial, e.g., maybe you want to stop after
     * a certain user behavior or performance threshold in the just completed
     * trial.
     */
    onActivityDataCreate: (ev: ActivityDataEvent) => {
      console.log(`********** trial complete`);
      console.log("newData: " + JSON.stringify(ev.newData));
      console.log("newData schema: " + JSON.stringify(ev.newDataSchema));
      console.log("data: " + JSON.stringify(ev.data));
      console.log("data schema: " + JSON.stringify(ev.dataSchema));
      console.log(
        "activity parameters: " + JSON.stringify(ev.activityConfiguration)
      );

      //#region to support m2c2kit in Android WebView
      if (contextIsAndroidWebView()) {
        sendEventToAndroid(ev);
      }
      //#endregion
    },
    /**
     * onActivityLifecycleChange() notifies us when an activity, such
     * as an assessment or a survey, has completed. Usually, however,
     * we want to know when all the activities are done, so we'll
     * look for the session ending via onSessionLifecycleChange
     */
    onActivityLifecycleChange: (ev: ActivityLifecycleEvent) => {
      if (ev.ended) {
        console.log(`ended activity ${ev.name}`);
        if (session.nextActivity) {
          session.advanceToNextActivity();
        } else {
          session.end();
        }
        //#region to support m2c2kit in Android WebView
        if (contextIsAndroidWebView()) {
          sendEventToAndroid(ev);
        }
        //#endregion
      }
    },
  },
});

/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or the Android WebView loadUrl() method
 * */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init();
