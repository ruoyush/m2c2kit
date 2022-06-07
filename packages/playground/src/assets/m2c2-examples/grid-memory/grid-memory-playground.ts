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
  LabelHorizontalAlignmentMode,
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
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class GridMemory extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * At run time, they can be changed with the setParameters() method.
     */
    const defaultParameters: GameParameters = {
      number_of_dots: {
        type: "number",
        value: 3,
        description: "Number of dots to present.",
      },      
      preparation_duration_ms: {
        type: "number",
        value: 500,
        description: "How long the 'get ready' message is shown, milliseconds.",
      },
      blank_grid_duration_ms: {
        type: "number",
        value: 500,
        description:
          "How long a blank grid is shown before the dots appear, milliseconds.",
      },
      interference_duration_ms: {
        type: "number",
        value: 8000,
        description:
          "How long the grid of interference targets is shown, milliseconds.",
      },
      interference_transition_animation: {
        type: "boolean",
        value: true,
        description:
          "Should the transitions between dot presentation, interference, and recall be animated slide transitions?",
      },
      dot_present_duration_ms: {
        type: "number",
        value: 3000,
        description: "How long the dots are shown, milliseconds.",
      },
      number_of_interference_targets: {
        type: "number",
        value: 5,
        description: "How many targets to show in the interference phase.",
      },
      number_of_trials: {
        type: "number",
        value: 4,
        description: "How many trials to run.",
      },
      trials_complete_scene_text: {
        type: "string",
        value: "You have completed all the grid memory trials",
        description: "Text for scene displayed after all trials are complete.",
      },
      trials_complete_scene_button_text: {
        type: "string",
        value: "OK",
        description:
          "Button text for scene displayed after all trials are complete.",
      },
      instruction_type: {
        type: "string",
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
    const gridMemoryTrialSchema: TrialSchema = {
      activity_begin_timestamp_ms: {
        type: "number",
        description:
          "Millisecond timestamp at the beginning of the game activity.",
      },
      trial_begin_timestamp_ms: {
        type: "number",
        description:
          "Millisecond timestamp at the beginning of the trial.",
      },      
      random_cells: {
        type: "array",
        description: "Randomly chosen locations of the dots",
        items: {
          type: "object",
          properties: {
            row: {
              type: "number",
              description: "Row of the cell, 0-indexed.",
            },
            column: {
              type: "number",
              description: "Column of the cell, 0-indexed.",
            },
          },
        },
      },
      selected_cells: {
        type: "array",
        description: "User selected locations of the dots.",
        items: {
          type: "object",
          properties: {
            row: {
              type: "number",
              description: "Row of the cell, 0-indexed.",
            },
            column: {
              type: "number",
              description: "Column of the cell, 0-indexed.",
            },
          },
        },
      },
      user_cell_actions: {
        type: "array",
        description: "Complete user dot actions: placement, removal, and done.",
        items: {
          type: "object",
          properties: {
            elapsed_duration_ms: {
              type: "number",
              description:
                "Duration, milliseconds, from when dot recall scene fully appeared until this user action.",
            },
            placed: {
              type: "boolean",
              description: "Was this action a dot placement?",
            },
            removed: {
              type: "boolean",
              description: "Was this action a dot removal?",
            },
            done: {
              type: "boolean",
              description: "Was this action a done button pushed?",
            },
            row: {
              type: "number",
              description: "Row of the cell, 0-indexed; -999 if non-applicable (done).",
            },
            column: {
              type: "number",
              description: "Column of the cell, 0-indexed; -999 if non-applicable (done).",
            },
          },
        },
      },
      user_interference_actions: {
        type: "array",
        description: "User actions tapping the interference targets.",
        items: {
          type: "object",
          properties: {
            elapsed_duration_ms: {
              type: "number",
              description:
                "Duration, milliseconds, from when interference scene fully appeared until this user action.",
            },
            on_target: {
              type: "boolean",
              description: "Was this action on the interference target or off?",
            },
          },
        },
      },
      number_of_correct_dots: {
        type: "number",
        description: "Number of dots that were correctly placed.",
      }
    };

    const img_default_size = 200;
    const options: GameOptions = {
      name: "Grid Memory",
      version: "0.0.1",
      shortDescription: "A short description of Grid Memory goes here...",
      longDescription:
        'Each trial of the dot memory task consisted of 3 phases: encoding, \
distraction, and retrieval. During the encoding phase, the participant was \
asked to remember the location three red dots appear on a 5 x 5 grid. After \
a 3-second study period, the grid was removed and the distraction phase \
began, during which the participant wasrequired to locate and touch Fs among \
an array of Es. After performing the distraction task for 8 seconds, and \
empty 5 x 5 grid reappeared on the screen and participants were then \
prompted to recall the locations of the 3 dots presented initially and press \
a button labeled "Done" after entering their responses to complete the trial. \
Participants completed 2 trials (encoding, distractor, retrieval) with a \
1-second delay between trials. The dependent variable was an error score with \
partial credit given based on the deviation from the correct positions. If \
all dots were recalled in their correct location, the participant received a \
score ofzero. In the case of one or more retrieval errors, Euclidean distance \
of the location of the incorrect dot to the correct grid location was \
calculated, with higher scores indicating less accurate placement and poorer \
performance (Siedlecki, 2007). The rationale for our use of this task as an \
indicator of working memory has both an empirical and theoreticalbasis. \
Previous research (Miyake, Friedman, Rettinger, Shah, & Hegarty, 2001) has \
demonstrated that a similar dotmemory task loaded on a factor representing \
working memory. The authors of this study reasoned that the spatial dot \
memory task placed high demands on controlled attention—a hallmark of working \
memory tasks. Indeed, individual differences in working memory capacity arise \
"in situations where information needs to be actively maintained or when a \
controlled search of memory is required" (Unsworth & Engle, 2007, p. 123). \
The ambulatory dot memory task satisfies this requirement by using an \
interference task to prevent rehearsal and produce interference with encoded \
locations, which creates the demand for active maintenance and controlled \
retrieval of previously encoded location during the recall phase. \
SOURCE: Sliwinski, Martin J., Jacqueline A. Mogle, Jinshil Hyun, Elizabeth \
Munoz, Joshua M. Smyth, and Richard B. Lipton. "Reliability and validity of \
ambulatory cognitive assessments." Assessment 25, no. 1 (2018): 14-30.',
      showFps: true,
      width: 400,
      height: 800,
      trialSchema: gridMemoryTrialSchema,
      parameters: defaultParameters,
      fontUrls: ["./fonts/roboto/Roboto-Regular.ttf"],
      images: [
        {
          name: "grid",
          height: img_default_size,
          width: img_default_size,
          url: "img/dotmem1_grid.png",
        },
        {
          name: "fs",
          height: img_default_size,
          width: img_default_size,
          url: "img/dotmem2_fs.png",
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
    // variables for timing and user input

    interface cell {
      row: number;
      column: number;
    };
    let randomCells: cell[];
    let tappedCells: cell[];
    interface UserCellAction {
      elapsed_duration_ms: number;
      placed: boolean;
      removed: boolean;
      done: boolean;
      row: number;
      column: number;
    }
    let userCellActions: UserCellAction[];
    interface UserInterferenceAction {
      elapsed_duration_ms: number;
      on_target: boolean;
    }
    let userInterferenceActions: UserInterferenceAction[];

    const NUMBER_OF_DOTS = game.getParameter<number>("number_of_dots")

    // ==============================================================
    // SCENES: instructions
    const instructionsScenes = Instructions.Create({
      sceneNamePrefix: "instructions",
      instructionScenes: [
        {
          title: "Grid Memory",
          text: `For this activity, try to remember the location of ${NUMBER_OF_DOTS} dots.`,
          image: "grid",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Grid Memory",
          text: `Before placing the ${NUMBER_OF_DOTS} dots in their location, you will also have to tap some Fs on the screen as quickly as you can.`,
          image: "fs",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Grid Memory",
          text: "Press START to begin!",
          textFontSize: 24,
          titleFontSize: 30,
          textAlignmentMode: LabelHorizontalAlignmentMode.center,
          nextButtonText: "START",
          nextButtonBackgroundColor: WebColors.Green,
        },
      ],
      postInstructionsScene: "preparationScene",
    });
    game.addScenes(instructionsScenes);

    let forward_into_interference_scene_transition: Transition | undefined;
    let back_from_interference_scene_transition: Transition | undefined;
    if (game.getParameter<boolean>("interference_transition_animation")) {
      forward_into_interference_scene_transition = Transition.slide({
        direction: TransitionDirection.left,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      });
      back_from_interference_scene_transition = Transition.slide({
        direction: TransitionDirection.right,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      });
    }

    // ==============================================================
    // SCENE: preparation. Show get ready message, then advance after XXXX
    // milliseconds (as defined in preparation_duration_ms parameter)
    const preparationScene = new Scene({
      name: "preparationScene",
    });
    game.addScene(preparationScene);

    const getReadyMessage = new Label({
      text: "Get Ready",
      fontSize: 24,
      position: { x: 200, y: 400 },
    });
    preparationScene.addChild(getReadyMessage);

    preparationScene.onAppear(() => {
      preparationScene.run(
        Action.sequence([
          Action.custom({
            callback: () => {
              game.addTrialData("activity_begin_timestamp_ms", this.beginTimestamp);
              game.addTrialData("trial_begin_timestamp_ms", Timer.now());
            },
          }),          
          Action.wait({
            duration: game.getParameter("preparation_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              game.presentScene(dotPresentationScene);
            },
          }),
        ])
      );
    });

    // ==============================================================
    // SCENE: Show the dot placement
    const dotPresentationScene = new Scene();
    game.addScene(dotPresentationScene);

    const rememberDotsMessage = new Label({
      text: "Remember the dot locations!",
      fontSize: 24,
      position: { x: 200, y: 150 },
    });
    dotPresentationScene.addChild(rememberDotsMessage);

    const presentationGrid = new Grid({
      size: { width: 300, height: 300 },
      position: { x: 200, y: 400 },
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    dotPresentationScene.addChild(presentationGrid);

    dotPresentationScene.onSetup(() => {
      rememberDotsMessage.hidden = true;
    });

    dotPresentationScene.onAppear(() => {
      // randomly choose 3 cells that will have the red dots
      // on a grid of size 5 rows, 5 columns
      rememberDotsMessage.hidden = false;

      dotPresentationScene.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("blank_grid_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              randomCells = RandomDraws.FromGridWithoutReplacement(NUMBER_OF_DOTS, 5, 5);
              for (let i = 0; i < NUMBER_OF_DOTS; i++) {
                const circle = new Shape({
                  circleOfRadius: 20,
                  fillColor: WebColors.Red,
                  strokeColor: WebColors.Black,
                  lineWidth: 2,
                });
                presentationGrid.addAtCell(
                  circle,
                  randomCells[i].row,
                  randomCells[i].column
                );
              }
            },
          }),
          Action.wait({
            duration: game.getParameter("dot_present_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              presentationGrid.removeAllChildren();
              rememberDotsMessage.hidden = true;
              game.presentScene(
                interferenceScene,
                forward_into_interference_scene_transition
              );
            },
          }),
        ])
      );
    });

    // ==============================================================
    // SCENE: interference. Ask participant to the touch the Fs
    const interferenceScene = new Scene();
    game.addScene(interferenceScene);

    const touchTheFs = new Label({
      text: "Touch the F's!",
      fontSize: 24,
      position: { x: 200, y: 100 },
    });
    interferenceScene.addChild(touchTheFs);

    const interferenceGrid = new Grid({
      size: { width: 300, height: 480 },
      position: { x: 200, y: 400 },
      rows: 8,
      columns: 5,
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });

    interferenceScene.addChild(interferenceGrid);

    interferenceScene.onSetup(() => {
      touchTheFs.hidden = true;
      ShowInterferenceActivity();

      // Advance to the next recall screen after "interference_duration_ms"
      interferenceScene.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("interference_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              Timer.remove("interferenceResponseTime");
              game.presentScene(
                dotRecallScene,
                back_from_interference_scene_transition
              );
            },
          }),
        ]),
        "advanceAfterInterference"
      );

      // On repeated showings of the grid, we will slide it into view
      // and slideGridIntoScene = true
      function ShowInterferenceActivity(slideGridIntoScene = false) {
        interferenceGrid.removeAllChildren();
        let tappedFCount = 0;

        // randomly choose six cells to have F in them from the grid that
        // is of size 8 rows and 5 columns
        const number_of_interference_targets = game.getParameter<number>(
          "number_of_interference_targets"
        );
        const FCells = RandomDraws.FromGridWithoutReplacement(
          number_of_interference_targets,
          8,
          5
        );
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 5; j++) {
            const square = new Shape({
              rect: { size: { width: 59, height: 59 } },
              fillColor: WebColors.Transparent,
            });
            //square.userData = 0;

            let letterIsF = false;
            let letter: Label;
            letter = new Label({ text: "E", fontSize: 50 });
            for (let k = 0; k < number_of_interference_targets; k++) {
              if (FCells[k].row === i && FCells[k].column === j) {
                letter = new Label({ text: "F", fontSize: 50 });
                letterIsF = true;
              }
            }

            if (letterIsF) {
              square.userData = 0;
            } else {
              square.userData = -1;
            }
            square.isUserInteractionEnabled = true;
            square.onTapDown(() => {
              if (square.userData === 0) {
                tappedFCount++;
                letter.text = "E";
                letter.run(
                  Action.sequence([
                    Action.scale({ scale: 1.25, duration: 125 }),
                    Action.scale({ scale: 1, duration: 125 }),
                  ])
                );
                square.userData = 1;
                if (tappedFCount >= number_of_interference_targets) {
                  // don't allow more taps on this current grid
                  interferenceGrid.gridChildren.forEach((cell) => {
                    cell.entity.isUserInteractionEnabled = false;
                  });

                  // show a new interference grid
                  // but this time, slide it into view
                  ShowInterferenceActivity(true);
                }
                userInterferenceActions.push({
                  elapsed_duration_ms: Timer.elapsed(
                    "interferenceResponseTime"
                  ),
                  on_target: true,
                });
              } else {
                userInterferenceActions.push({
                  elapsed_duration_ms: Timer.elapsed(
                    "interferenceResponseTime"
                  ),
                  on_target: false,
                });
              }
            });

            interferenceGrid.addAtCell(letter, i, j);
            interferenceGrid.addAtCell(square, i, j);
          }
        }

        if (slideGridIntoScene) {
          interferenceGrid.position = { x: 200, y: 1040 };
          interferenceGrid.run(
            Action.move({ point: { x: 200, y: 400 }, duration: 500 })
          );
        }
      }
    });

    interferenceScene.onAppear(() => {
      touchTheFs.hidden = false;
      userInterferenceActions = new Array<UserInterferenceAction>();
      Timer.start("interferenceResponseTime");
    });

    // ==============================================================
    // SCENE: recall. Ask participant to recall the dot positions
    const dotRecallScene = new Scene();
    game.addScene(dotRecallScene);

    const whereDotsMessage = new Label({
      text: "Where were the dots?",
      fontSize: 24,
      position: { x: 200, y: 150 },
    });
    dotRecallScene.addChild(whereDotsMessage);

    const recallGrid = new Grid({
      size: { width: 300, height: 300 },
      position: { x: 200, y: 400 },
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    dotRecallScene.addChild(recallGrid);

    let tappedCellCount = 0;

    dotRecallScene.onSetup(() => {
      recallGrid.removeAllChildren();
      recallDoneButton.hidden = true;
      whereDotsMessage.hidden = true;

      tappedCellCount = 0;
      tappedCells = new Array<{
        row: number;
        column: number;
      }>();
      userCellActions = new Array<UserCellAction>();

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const cell = new Shape({
            // this rectangle will be the hit area for the cell
            // it's transparent -- we use it only for its hit
            // area. Make it 59 x 59 (not 60 x 60) to avoid overlap
            // of hit area on the borders
            rect: { size: { width: 59, height: 59 } },
            fillColor: WebColors.Transparent,
          });
          // an entity's userData is a property we can use to store
          // anything we want. Here, we use it simply to keep track
          // of whether the cell has been tapped or not.
          cell.userData = 0;
          cell.onTapDown(() => {
            if (cell.userData === 0 && tappedCellCount < NUMBER_OF_DOTS) {
              // cell has not been tapped, and there are not yet
              // 3 circles placed
              const circle = new Shape({
                circleOfRadius: 20,
                fillColor: WebColors.Red,
                strokeColor: WebColors.Black,
                lineWidth: 2,
              });
              cell.addChild(circle);
              cell.userData = 1;
              tappedCellCount++;
              tappedCells.push({ row: i, column: j });
              userCellActions.push({
                elapsed_duration_ms: Timer.elapsed("responseTime"),
                placed: true,
                removed: false,
                done: false,
                row: i,
                column: j,
              });
            } else if (cell.userData === 1) {
              // this cell has been tapped. Remove the circle from here
              cell.removeAllChildren();
              cell.userData = 0;
              tappedCellCount--;
              // remove this "untapped" cell from the recorded data of tapped cells
              tappedCells = tappedCells.filter(
                (cell) => !(cell.row === i && cell.column === j)
              );
              userCellActions.push({
                elapsed_duration_ms: Timer.elapsed("responseTime"),
                placed: false,
                removed: true,
                done: false,
                row: i,
                column: j,
              });
            }
          });
          cell.isUserInteractionEnabled = true;
          recallGrid.addAtCell(cell, i, j);
        }
      }
    });

    dotRecallScene.onAppear(() => {
      Timer.start("responseTime");
      recallDoneButton.hidden = false;
      whereDotsMessage.hidden = false;
    });

    const recallDoneButton = new Button({
      text: "Done",
      position: { x: 200, y: 700 },
      size: { width: 250, height: 50 },
    });
    dotRecallScene.addChild(recallDoneButton);

    // place this warning message on the scene, but hide it
    // we'll unhide it, if needed.
    const youMustSelectAllMessage = new Label({
      text: `You must select all ${NUMBER_OF_DOTS} locations!`,
      position: { x: 200, y: 600 },
    });
    youMustSelectAllMessage.hidden = true;
    dotRecallScene.addChild(youMustSelectAllMessage);

    recallDoneButton.isUserInteractionEnabled = true;
    recallDoneButton.onTapDown(() => {
      userCellActions.push({
        elapsed_duration_ms: Timer.elapsed("responseTime"),
        placed: false,
        removed: false,
        done: true,
        row: -999,
        column: -999,
      });

      if (tappedCellCount < NUMBER_OF_DOTS) {
        youMustSelectAllMessage.run(
          Action.sequence([
            Action.custom({
              callback: () => {
                youMustSelectAllMessage.hidden = false;
              },
            }),
            Action.wait({ duration: 3000 }),
            Action.custom({
              callback: () => {
                youMustSelectAllMessage.hidden = true;
              },
            }),
          ])
        );
      } else {
        Timer.stop("responseTime");
        Timer.remove("responseTime");

        game.addTrialData("random_cells", randomCells);
        game.addTrialData("selected_cells", tappedCells);
        game.addTrialData("user_cell_actions", userCellActions);
        game.addTrialData("user_interference_actions", userInterferenceActions);

        const cellsEqual = ( cell1: cell, cell2: cell): boolean => {
          return cell1.row === cell2.row && cell1.column === cell2.column;
        }
        const numberOfCorrectDots = tappedCells
          .map(tappedCell => randomCells.some((randomCell) => cellsEqual(randomCell,tappedCell)) ? 1 : 0)
          .reduce((a: number, b) => a + b, 0);   
        game.addTrialData("number_of_correct_dots", numberOfCorrectDots);
        game.trialComplete();
        if (game.trialIndex === game.getParameter("number_of_trials")) {
          const nextScreenTransition = Transition.slide({
            direction: TransitionDirection.left,
            duration: 500,
            easing: Easings.sinusoidalInOut,
          });
          game.presentScene(doneScene, nextScreenTransition);
        } else {
          game.presentScene(preparationScene);
        }
      }
    });

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
      position: { x: 200, y: 600 },
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

const gridMemory = new GridMemory();
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
      console.log(
        "activity parameters schema: " +
          JSON.stringify(ev.activityConfigurationSchema)
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
