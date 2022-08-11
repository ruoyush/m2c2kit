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
  Easings,
  Sprite,
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class GridMemory extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * Each game parameter should have a type, default (this is the default
     * value), and a description.
     */
    const defaultParameters: GameParameters = {
      number_of_dots: {
        type: "integer",
        default: 3,
        description: "Number of dots to present.",
      },
      preparation_duration_ms: {
        type: "number",
        default: 500,
        description: "How long the 'get ready' message is shown, milliseconds.",
      },
      blank_grid_duration_ms: {
        type: "number",
        default: 500,
        description:
          "How long a blank grid is shown before the dots appear, milliseconds.",
      },
      interference_duration_ms: {
        type: "number",
        default: 8000,
        description:
          "How long the grid of interference targets is shown, milliseconds.",
      },
      interference_transition_animation: {
        type: "boolean",
        default: true,
        description:
          "Should the transitions between dot presentation, interference, and recall be animated slide transitions?",
      },
      dot_present_duration_ms: {
        type: "number",
        default: 3000,
        description: "How long the dots are shown, milliseconds.",
      },
      number_of_interference_targets: {
        type: "integer",
        default: 5,
        description: "How many targets to show in the interference phase.",
      },
      number_of_trials: {
        type: "integer",
        default: 4,
        description: "How many trials to run.",
      },
      trials_complete_scene_text: {
        type: "string",
        default: "You have completed all the grid memory trials",
        description: "Text for scene displayed after all trials are complete.",
      },
      trials_complete_scene_button_text: {
        type: "string",
        default: "OK",
        description:
          "Button text for scene displayed after all trials are complete.",
      },
      instruction_type: {
        type: "string",
        default: "long",
        description: "Type of intructions to show, 'short' or 'long'.",
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
    const gridMemoryTrialSchema: TrialSchema = {
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
      presented_cells: {
        type: ["array", "null"],
        description:
          "Randomly chosen locations of the dots presented to the user. Null if trial was skipped.",
        items: {
          type: "object",
          properties: {
            row: {
              type: "integer",
              description: "Row of the cell, 0-indexed.",
            },
            column: {
              type: "integer",
              description: "Column of the cell, 0-indexed.",
            },
          },
        },
      },
      selected_cells: {
        type: ["array", "null"],
        description:
          "User selected locations of the dots. Null if trial was skipped.",
        items: {
          type: "object",
          properties: {
            row: {
              type: "integer",
              description: "Row of the cell, 0-indexed.",
            },
            column: {
              type: "integer",
              description: "Column of the cell, 0-indexed.",
            },
          },
        },
      },
      user_dot_actions: {
        type: ["array", "null"],
        description:
          "Complete user dot actions: placement, removal, and done. Null if trial was skipped.",
        items: {
          type: "object",
          properties: {
            elapsed_duration_ms: {
              type: "number",
              description:
                "Duration, milliseconds, from when dot recall scene fully appeared until this user action.",
            },
            action_type: {
              type: "string",
              enum: ["placed", "removed", "done"],
              description:
                "Was the action a dot placement, dot removal, or done button push?",
            },
            cell: {
              type: ["object", "null"],
              description:
                "Cell of user action; null if non-applicable (user action was done button push).",
              properties: {
                row: {
                  type: "integer",
                  description: "Row of the cell, 0-indexed.",
                },
                column: {
                  type: "integer",
                  description: "Column of the cell, 0-indexed.",
                },
                tap_x: {
                  type: "number",
                  description:
                    "X coordinate of user's tap on the cell, relative to the cell.",
                },
                tap_y: {
                  type: "number",
                  description:
                    "Y coordinate of user's tap on the cell, relative to the cell.",
                },
              },
            },
          },
        },
      },
      user_interference_actions: {
        type: ["array", "null"],
        description:
          "User actions tapping the interference targets. Null if trial was skipped.",
        items: {
          type: "object",
          properties: {
            elapsed_duration_ms: {
              type: "number",
              description:
                "Duration, milliseconds, from when interference scene fully appeared until this user action.",
            },
            action_type: {
              type: "string",
              enum: ["on-target", "off-target"],
              description: "Was the action on an interference target or off?",
            },
            cell: {
              type: "object",
              description: "Cell of user interference action.",
              properties: {
                row: {
                  type: "integer",
                  description: "Row of the cell, 0-indexed.",
                },
                column: {
                  type: "integer",
                  description: "Column of the cell, 0-indexed.",
                },
                tap_x: {
                  type: "number",
                  description:
                    "X coordinate of user's tap on the cell, relative to the cell.",
                },
                tap_y: {
                  type: "number",
                  description:
                    "Y coordinate of user's tap on the cell, relative to the cell.",
                },
              },
            },
          },
        },
      },
      number_of_correct_dots: {
        type: ["integer", "null"],
        description:
          "Number of dots that were correctly placed. Null if trial was skipped.",
      },
      quit_button_pressed: {
        type: "boolean",
        description: "Was the quit button pressed?",
      },
    };

    const img_default_size = 200;
    const options: GameOptions = {
      name: "Grid Memory",
      id: "grid-memory",
      version: "0.8.0",
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
      showFps: defaultParameters.show_fps.default,
      width: 400,
      height: 800,
      trialSchema: gridMemoryTrialSchema,
      parameters: defaultParameters,
      fontUrls: ["assets/grid-memory/fonts/roboto/Roboto-Regular.ttf"],
      images: [
        {
          name: "grid",
          height: img_default_size,
          width: img_default_size,
          url: "assets/grid-memory/img/dotmem1_grid.png",
        },
        {
          name: "fs",
          height: img_default_size,
          width: img_default_size,
          url: "assets/grid-memory/img/dotmem2_fs.png",
        },
        {
          name: "circle-x",
          height: 32,
          width: 32,
          // the svg is from evericons and is licensed under CC0 1.0
          // Universal (Public Domain). see https://www.patreon.com/evericons
          url: "assets/grid-memory/img/circle-x.svg",
        },
      ],
    };

    super(options);
  }

  override init(): void {
    // just for convenience, alias the variable game to "this"
    // (even though eslint doesn't like it)
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    // ==============================================================
    // variables user actions with dots and interference targets

    interface cell {
      row: number;
      column: number;
    }
    let presentedCells: cell[];
    let selectedCells: cell[];

    interface UserAction {
      elapsed_duration_ms: number;
      action_type: "placed" | "removed" | "done" | "on-target" | "off-target";
      cell: null | {
        row: number | null;
        column: number | null;
        tap_x: number | null;
        tap_y: number | null;
      };
    }

    let userDotActions: UserAction[];
    let userInterferenceActions: UserAction[];

    const NUMBER_OF_DOTS = game.getParameter<number>("number_of_dots");

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
    // SCENES: instructions
    const instructionsScenes = Instructions.Create({
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
          textAlignmentMode: LabelHorizontalAlignmentMode.Center,
          nextButtonText: "START",
          nextButtonBackgroundColor: WebColors.Green,
        },
      ],
    });
    game.addScenes(instructionsScenes);
    instructionsScenes[0].onAppear(() => {
      // in case user quits before starting trial, record the timestamp
      game.addTrialData(
        "activity_begin_iso8601_timestamp",
        this.beginIso8601Timestamp
      );
    });

    let forward_into_interference_scene_transition: Transition | undefined;
    let back_from_interference_scene_transition: Transition | undefined;
    if (game.getParameter<boolean>("interference_transition_animation")) {
      forward_into_interference_scene_transition = Transition.slide({
        direction: TransitionDirection.Left,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      });
      back_from_interference_scene_transition = Transition.slide({
        direction: TransitionDirection.Right,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      });
    }

    // ==============================================================
    // SCENE: preparation. Show get ready message, then advance after XXXX
    // milliseconds (as defined in preparation_duration_ms parameter)
    const preparationScene = new Scene();
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
              game.addTrialData(
                "activity_begin_iso8601_timestamp",
                this.beginIso8601Timestamp
              );
              game.addTrialData(
                "trial_begin_iso8601_timestamp",
                new Date().toISOString()
              );
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
      // randomly choose 3 (NUMBER_OF_DOTS) cells that will have the red dots
      // on a grid of size 5 rows, 5 columns
      rememberDotsMessage.hidden = false;

      dotPresentationScene.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("blank_grid_duration_ms"),
          }),
          Action.custom({
            callback: () => {
              presentedCells = RandomDraws.FromGridWithoutReplacement(
                NUMBER_OF_DOTS,
                5,
                5
              );
              for (let i = 0; i < NUMBER_OF_DOTS; i++) {
                const circle = new Shape({
                  circleOfRadius: 20,
                  fillColor: WebColors.Red,
                  strokeColor: WebColors.Black,
                  lineWidth: 2,
                });
                presentationGrid.addAtCell(
                  circle,
                  presentedCells[i].row,
                  presentedCells[i].column
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
      userInterferenceActions = new Array<UserAction>();
      // note: we should really start the timer in onAppear, but that can
      // cause a problem if that user taps a target before the timer starts
      // TODO: refactor so that the tappability of targets is turned on
      // only in onAppear
      Timer.start("interferenceResponseTime");

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

            let letterIsF = false;
            let letter: Label;
            letter = new Label({ text: "E", fontSize: 50 });
            for (let k = 0; k < number_of_interference_targets; k++) {
              if (FCells[k].row === i && FCells[k].column === j) {
                letter = new Label({ text: "F", fontSize: 50 });
                letterIsF = true;
              }
            }
            interface squareUserData {
              row: number;
              column: number;
              tapStatus: number;
            }

            square.userData = {};
            (<squareUserData>square.userData).row = i;
            (<squareUserData>square.userData).column = j;

            if (letterIsF) {
              // square can be tapped, but yet not tapped
              (<squareUserData>square.userData).tapStatus = 0;
            } else {
              // square cannot be tapped
              (<squareUserData>square.userData).tapStatus = -1;
            }
            square.isUserInteractionEnabled = true;
            square.onTapDown((e) => {
              if ((<squareUserData>square.userData).tapStatus === 0) {
                tappedFCount++;
                letter.text = "E";
                letter.run(
                  Action.sequence([
                    Action.scale({ scale: 1.25, duration: 125 }),
                    Action.scale({ scale: 1, duration: 125 }),
                  ])
                );
                // square has been tapped
                (<squareUserData>square.userData).tapStatus = 1;
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
                  action_type: "on-target",
                  cell: {
                    row: (<squareUserData>square.userData).row,
                    column: (<squareUserData>square.userData).column,
                    tap_x: e.point.x,
                    tap_y: e.point.y,
                  },
                });
              } else {
                userInterferenceActions.push({
                  elapsed_duration_ms: Timer.elapsed(
                    "interferenceResponseTime"
                  ),
                  action_type: "off-target",
                  cell: {
                    row: (<squareUserData>square.userData).row,
                    column: (<squareUserData>square.userData).column,
                    tap_x: e.point.x,
                    tap_y: e.point.y,
                  },
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
      // note: we should really start the timer in onAppear, but that can
      // cause a problem if that user taps a target before the timer starts
      // TODO: refactor so that the tappability of targets is turned on
      // only in onAppear
      Timer.start("responseTime");

      recallGrid.removeAllChildren();
      recallDoneButton.hidden = true;
      whereDotsMessage.hidden = true;

      tappedCellCount = 0;
      selectedCells = new Array<{
        row: number;
        column: number;
      }>();
      userDotActions = new Array<UserAction>();

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
          cell.onTapDown((e) => {
            if (cell.userData === 0 && tappedCellCount < NUMBER_OF_DOTS) {
              // cell has not been tapped, and there are not yet
              // 3 (NUMBER_OF_DOTS) circles placed
              const circle = new Shape({
                circleOfRadius: 20,
                fillColor: WebColors.Red,
                strokeColor: WebColors.Black,
                lineWidth: 2,
              });
              cell.addChild(circle);
              cell.userData = 1;
              tappedCellCount++;
              selectedCells.push({ row: i, column: j });
              userDotActions.push({
                elapsed_duration_ms: Timer.elapsed("responseTime"),
                action_type: "placed",
                cell: {
                  row: i,
                  column: j,
                  tap_x: e.point.x,
                  tap_y: e.point.y,
                },
              });
            } else if (cell.userData === 1) {
              // this cell has been tapped. Remove the circle from here
              cell.removeAllChildren();
              cell.userData = 0;
              tappedCellCount--;
              // remove this "untapped" cell from the recorded data of tapped cells
              selectedCells = selectedCells.filter(
                (cell) => !(cell.row === i && cell.column === j)
              );
              userDotActions.push({
                elapsed_duration_ms: Timer.elapsed("responseTime"),
                action_type: "removed",
                cell: {
                  row: i,
                  column: j,
                  tap_x: e.point.x,
                  tap_y: e.point.y,
                },
              });
            }
          });
          cell.isUserInteractionEnabled = true;
          recallGrid.addAtCell(cell, i, j);
        }
      }
    });

    dotRecallScene.onAppear(() => {
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
      hidden: true,
    });
    dotRecallScene.addChild(youMustSelectAllMessage);

    recallDoneButton.isUserInteractionEnabled = true;
    recallDoneButton.onTapDown(() => {
      userDotActions.push({
        elapsed_duration_ms: Timer.elapsed("responseTime"),
        action_type: "done",
        cell: null,
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

        game.addTrialData("presented_cells", presentedCells);
        game.addTrialData("selected_cells", selectedCells);
        game.addTrialData("user_dot_actions", userDotActions);
        game.addTrialData("user_interference_actions", userInterferenceActions);

        const cellsEqual = (cell1: cell, cell2: cell): boolean => {
          return cell1.row === cell2.row && cell1.column === cell2.column;
        };
        const numberOfCorrectDots = selectedCells
          .map((selectedCell) =>
            presentedCells.some((presentedCell) =>
              cellsEqual(presentedCell, selectedCell)
            )
              ? 1
              : 0
          )
          .reduce((a: number, b) => a + b, 0);
        game.addTrialData("number_of_correct_dots", numberOfCorrectDots);
        game.addTrialData("quit_button_pressed", false);
        game.addTrialData("trial_index", game.trialIndex);
        game.trialComplete();
        if (game.trialIndex === game.getParameter("number_of_trials")) {
          const nextScreenTransition = Transition.slide({
            direction: TransitionDirection.Left,
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
    doneScene.onSetup(() => {
      // no need to have cancel button, because we're done
      game.removeAllFreeEntities();
    });
  }
}

export { GridMemory };
