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
  SessionLifecycleEvent,
  ActivityDataEvent,
  ActivityLifecycleEvent,
  Sprite,
  Easings,
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";
import { SageResearch } from "@m2c2kit/sageresearch";

class SymbolSearch extends Game {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * At run time, they can be changed with the setParameters() method.
     */
    const defaultParameters: GameParameters = {
      number_of_top_pairs: {
        value: 3,
        type: "integer",
        enum: [1, 2, 3, 4],
        description: "Number of pairs to be shown on top. (1-4)",
      },
      lure_percent: {
        value: 0.5,
        type: "number",
        description:
          "Percentage of lure trials. Number from 0 to 1. A lure trial is \
when the incorrect symbol pair on the bottom contains exactly one symbol \
that is found on the top.(1 unique symbol). A non-lure trial is when the \
incorrect symbol pair contains exactly zero symbols that match the \
top. (2 unique symbols.)",
      },
      left_correct_percent: {
        value: 0.5,
        type: "number",
        description:
          "Percentage of trials where the left pair is the correct answer. Number from 0 to 1.",
      },
      preparation_duration_ms: {
        value: 3000,
        type: "number",
        description:
          "Duration of the preparation phase ('get ready' countdown, milliseconds). Multiples of 1000 recommended.",
      },
      after_preparation_transition_duration_ms: {
        value: 500,
        type: "number",
        description:
          "Duration, in milliseconds, of the slide in animation after the preparation phase.",
      },
      number_of_trials: {
        value: 5,
        type: "integer",
        description: "How many trials to run.",
      },
      interstimulus_animation: {
        value: true,
        type: "boolean",
        description: "Should new trials slide in from right to left?",
      },
      interstimulus_interval_duration_ms: {
        value: 500,
        type: "number",
        description:
          "If interstimulus_animation == true, the duration, in milliseconds, of the slide in animation after each trial. Otherise, the duration, in milliseconds, to wait after a trial has been completed until a new trial appears.",
      },
      instruction_type: {
        value: "long",
        type: "string",
        enum: ["short", "long"],
        description: "Type of instructions to show, 'short' or 'long'.",
      },
      trials_complete_scene_text: {
        value: "You have completed all the symbol search trials",
        type: "string",
        description: "Text for scene displayed after all trials are complete.",
      },
      trials_complete_scene_button_text: {
        value: "OK",
        type: "string",
        description:
          "Button text for scene displayed after all trials are complete.",
      },
      show_quit_button: {
        type: "boolean",
        value: true,
        description: "Should the activity quit button be shown?",
      },
      show_fps: {
        type: "boolean",
        value: false,
        description: "Should the FPS be shown?",
      },
    };

    /**
     * This describes all the data that will be generated by the assessment.
     * At runtime, when a trial completes, the data will be returned to the
     * session with a callback, along with this schema transformed into
     * JSON Schema Draft-07 format.
     */
    const symbolSearchTrialSchema: TrialSchema = {
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
      trial_type: {
        type: ["string", "null"],
        enum: ["normal", "lure", null],
        description:
          "Indicates if trial was normal or lure. Null if trial was skipped.",
      },
      card_configuration: {
        type: ["object", "null"],
        description: "Symbols used on cards. Null if trial was skipped.",
        properties: {
          top_cards_symbols: {
            type: "array",
            description:
              "Symbols of the top cards, starting at 0 for leftmost upper card and incrementing by 1 moving right.",
            items: {
              type: "object",
              properties: {
                top: {
                  type: "integer",
                  description:
                    "Index of the top symbol within the card, 1-based.",
                },
                bottom: {
                  type: "integer",
                  description:
                    "Index of the bottom symbol within the card, 1-based.",
                },
              },
            },
          },
          bottom_cards_symbols: {
            type: "array",
            description:
              "Symbols of the bottom cards, starting at 0 for leftmost card and incrementing by 1 moving right.",
            items: {
              type: "object",
              properties: {
                top: {
                  type: "integer",
                  description:
                    "Index of the top symbol within the card, 1-based.",
                },
                bottom: {
                  type: "integer",
                  description:
                    "Index of the bottom symbol within the card, 1-based.",
                },
              },
            },
          },
        },
      },
      response_time_duration_ms: {
        type: ["number", "null"],
        description:
          "Milliseconds from the beginning of the trial until a user taps a response. Null if trial was skipped.",
      },
      user_response_index: {
        type: ["integer", "null"],
        description:
          "Index of user selected response, starting at 0 for leftmost card and incrementing by 1 moving right. Null if trial was skipped.",
      },
      correct_response_index: {
        type: ["integer", "null"],
        description:
          "Index of correct response, starting at 0 for leftmost card and incrementing by 1 moving right. Null if trial was skipped.",
      },
      quit_button_pressed: {
        type: "boolean",
        description: "Was the quit button pressed?",
      },
    };

    const symbol_image_size = 160;

    const options: GameOptions = {
      name: "Symbol Search",
      id: "symbol-search",
      version: "0.0.1",
      shortDescription:
        "Symbol Search is a test of processing speed, where \
participants see a row of symbol pairs at the top of the screen and match \
them to symbol pairs at the bottom of the screen.",
      longDescription:
        'On each trial of the symbol search task, participants saw a row of \
three symbol pairs at the top of the screen and were presented with two \
symbol pairs at the bottom of the screen. Stimuli were presented until a \
response was provided there was an interval of 200 msec. between each \
response and the following stimulus. Participants decided, as quickly as \
possible, which of the two pairs presented at the bottom of the screen was \
among the pairs at the top of the screen (see Figure 1). Participants \
completed 12 trials of this task. The dependent variable was median response \
time of correct trials. Because this task requires speeded comparisons \
similar to standard laboratory tests, we reasoned it would be a viable \
indicator of perceptual speed. SOURCE: Sliwinski, Martin J., Jacqueline A. \
Mogle, Jinshil Hyun, Elizabeth Munoz, Joshua M. Smyth, and Richard B. Lipton. \
"Reliability and validity of ambulatory cognitive assessments." Assessment \
25, no. 1 (2018): 14-30.',
      showFps: defaultParameters.show_fps.value,
      width: 400,
      height: 800,
      trialSchema: symbolSearchTrialSchema,
      parameters: defaultParameters,
      fontUrls: ["assets/symbol-search/fonts/roboto/Roboto-Regular.ttf"],
      bodyBackgroundColor: WebColors.White,
      images: [
        {
          name: "gameImage",
          height: 274,
          width: 280,
          url: "assets/symbol-search/img/gameImage.svg",
        },
        {
          name: "gameImageOutlinedCards",
          height: 274,
          width: 280,
          url: "assets/symbol-search/img/gameImageOutlinedCards.svg",
        },
        {
          name: "stopwatchImage",
          height: 319,
          width: 256,
          // license is public domain
          // https://commons.wikimedia.org/wiki/File:Dtjohnnymonkey-Stopwatch-no-shading.svg
          url: "assets/symbol-search/img/stopwatch.svg",
        },
        {
          name: "ssintroImage",
          height: 190,
          width: 360,
          url: "assets/symbol-search/img/ssintroImage.svg",
        },
        // NOTE: names of symbols must be in form of ss-01, starting
        // at ss-01, not ss-00.
        {
          name: "ss-01",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-01.svg",
        },
        {
          name: "ss-02",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-02.svg",
        },
        {
          name: "ss-03",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-03.svg",
        },
        {
          name: "ss-04",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-04.svg",
        },
        {
          name: "ss-05",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-05.svg",
        },
        {
          name: "ss-06",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-06.svg",
        },
        {
          name: "ss-07",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-07.svg",
        },
        {
          name: "ss-08",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-08.svg",
        },
        {
          name: "ss-09",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-09.svg",
        },
        {
          name: "ss-10",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-10.svg",
        },
        {
          name: "ss-11",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-11.svg",
        },
        {
          name: "ss-12",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-12.svg",
        },
        {
          name: "ss-13",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-13.svg",
        },
        {
          name: "ss-14",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-14.svg",
        },
        {
          name: "ss-15",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-15.svg",
        },
        {
          name: "ss-16",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-16.svg",
        },
        {
          name: "ss-17",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-17.svg",
        },
        {
          name: "ss-18",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-18.svg",
        },
        {
          name: "ss-19",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-19.svg",
        },
        {
          name: "ss-20",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-20.svg",
        },
        {
          name: "ss-21",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-21.svg",
        },
        {
          name: "ss-22",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-22.svg",
        },
        {
          name: "ss-23",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-23.svg",
        },
        {
          name: "ss-24",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "assets/symbol-search/img/ss-24.svg",
        },
        {
          name: "circle-x",
          height: 32,
          width: 32,
          // the svg is from evericons and is licensed under CC0 1.0
          // Universal (Public Domain). see https://www.patreon.com/evericons
          url: "assets/symbol-search/img/circle-x.svg",
        },
      ],
    };

    super(options);
  }

  override init() {
    // just for convenience, alias the variable game to "this"
    // (even though eslint doesn't like it)
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    // these are defined in game options images
    const NUMBER_OF_SYMBOLS = 24;

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

    // ==================================================
    // SCENES: instructions

    let instructionsScenes: Array<Scene>;

    /**
     * sharedInstructionsOptions are what is the the same for short
     * and long instructions
     */
    const sharedInstructionsOptions = {
      sceneNamePrefix: "instructions",
      backgroundColor: WebColors.White,
      nextButtonBackgroundColor: WebColors.Black,
      backButtonBackgroundColor: WebColors.Black,
      nextSceneTransition: Transition.slide({
        direction: TransitionDirection.left,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      }),
      backSceneTransition: Transition.slide({
        direction: TransitionDirection.right,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      }),
      postInstructionsScene: "countdownScene",
    };

    switch (game.getParameter("instruction_type")) {
      case "short": {
        instructionsScenes = Instructions.Create({
          ...sharedInstructionsOptions,
          instructionScenes: [
            {
              title: "Symbol Search",
              text: "Goal: Touch the set on the bottom that is exactly the same as a set above, as fast and accurately as you can.",
              image: "ssintroImage",
              imageAboveText: false,
              imageMarginTop: 12,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.25,
              nextButtonText: "START",
              nextButtonBackgroundColor: WebColors.Green,
            },
          ],
        });
        break;
      }
      case "long": {
        instructionsScenes = Instructions.Create({
          ...sharedInstructionsOptions,
          instructionScenes: [
            {
              title: "Symbol Search",
              text: "You will see sets of symbols on the top and bottom of the screen.",
              image: "gameImage",
              imageAboveText: false,
              imageMarginTop: 12,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.25,
            },
            {
              title: "Symbol Search",
              text: "When prompted, touch the set on the bottom that is exactly the same as a set above.",
              image: "gameImageOutlinedCards",
              imageAboveText: false,
              imageMarginTop: 12,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.25,
            },
            {
              title: "Symbol Search",
              text: "Please be as fast and accurate as you can",
              image: "stopwatchImage",
              imageAboveText: false,
              imageMarginTop: 48,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.25,
              nextButtonText: "START",
              nextButtonBackgroundColor: WebColors.Green,
            },
          ],
        });
        break;
      }
      default: {
        throw new Error(
          `invalid value for instruction_type: ${game.getParameter(
            "instruction_type"
          )}`
        );
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

    game.entryScene = "instructions-01";
    game.addScenes(instructionsScenes);

    const afterTrialSceneTransition = Transition.slide({
      direction: TransitionDirection.left,
      duration: game.getParameter("interstimulus_interval_duration_ms"),
      easing: Easings.sinusoidalInOut,
    });

    // ==================================================
    // SCENE: countdownScene

    const countdownScene = new Scene({
      name: "countdownScene",
      backgroundColor: [255, 255, 255, 1],
    });
    game.addScene(countdownScene);

    const countdownCircle = new Shape({
      circleOfRadius: 100,
      position: { x: 200, y: 350 },
      fillColor: [44, 90, 255, 1],
    });

    countdownScene.addChild(countdownCircle);

    const countdownInitialNumber = Math.floor(
      game.getParameter<number>("preparation_duration_ms") / 1000
    );

    const countdownNumber = new Label({
      text: countdownInitialNumber.toString(),
      fontSize: 50,
      preferredMaxLayoutWidth: 200,
      horizontalAlignmentMode: LabelHorizontalAlignmentMode.center,
      fontColor: [255, 255, 255, 1],
    });
    countdownCircle.addChild(countdownNumber);

    const getreadyLabel = new Label({
      text: "GET READY",
      fontSize: 50,
      preferredMaxLayoutWidth: 300,
      horizontalAlignmentMode: LabelHorizontalAlignmentMode.center,
      position: { x: 200, y: 500 },
    });
    countdownScene.addChild(getreadyLabel);

    countdownScene.onAppear(() => {
      const countdownSequence = new Array<Action>();

      for (let i = countdownInitialNumber - 1; i > 0; i--) {
        countdownSequence.push(Action.wait({ duration: 1000 }));
        countdownSequence.push(
          Action.custom({
            callback: () => {
              countdownNumber.text = i.toString();
            },
          })
        );
      }

      countdownSequence.push(Action.wait({ duration: 1000 }));
      countdownSequence.push(
        Action.custom({
          callback: () => {
            countdownNumber.text = "0";
          },
        })
      );

      countdownSequence.push(
        Action.custom({
          callback: () => {
            game.presentScene(
              chooseCardScene,
              Transition.slide({
                direction: TransitionDirection.left,
                duration: game.getParameter(
                  "after_preparation_transition_duration_ms"
                ),
                easing: Easings.sinusoidalInOut,
              })
            );
          },
        })
      );
      countdownScene.run(Action.sequence(countdownSequence));
    });

    // ==================================================
    // SCENE: chooseCardScene

    const chooseCardScene = new Scene({
      name: "chooseCardScene",
      backgroundColor: [169, 201, 219, 1],
    });
    game.addScene(chooseCardScene);

    const bottomBackground = new Shape({
      rect: { size: { width: 400, height: 400 } },
      fillColor: [166, 177, 181, 1],
      position: { x: 200, y: 600 },
    });
    chooseCardScene.addChild(bottomBackground);

    const questionLabel = new Label({
      text: "Which of these matches a pair above?",
      fontSize: 22,
      preferredMaxLayoutWidth: 240,
    });
    chooseCardScene.addChild(questionLabel);
    questionLabel.position = { x: 200, y: 460 };

    const orLabel = new Label({
      text: "or",
      fontSize: 22,
      preferredMaxLayoutWidth: 240,
    });
    chooseCardScene.addChild(orLabel);
    orLabel.position = { x: 200, y: 580 };

    interface SymbolCard {
      top: number;
      bottom: number;
    }

    interface bottomCardUserData {
      index: number;
    }

    /**
     * note: these are in snake_case because we will directly serialize
     * these into the trial data
     */
    interface TrialConfiguration {
      top_cards_symbols: Array<SymbolCard>;
      bottom_cards_symbols: Array<SymbolCard>;
      trial_type: "normal" | "lure";
      correct_response_index: number;
    }

    const trialConfigurations: Array<TrialConfiguration> = [];

    const numberOfTrials = game.getParameter<number>("number_of_trials");
    const lurePercent = game.getParameter<number>("lure_percent");
    const leftCorrectPercent = game.getParameter<number>(
      "left_correct_percent"
    );
    const numberOfTopCards = game.getParameter<number>("number_of_top_pairs");
    // TODO: allow number of bottom cards to be configurable
    // const numberOfBottomCards = 2;
    const numberOfLureTrials = Math.round(numberOfTrials * lurePercent);
    const numberOfLeftCorrectTrials = Math.round(
      numberOfTrials * leftCorrectPercent
    );
    const lureTrialIndexes = RandomDraws.FromRangeWithoutReplacement(
      numberOfLureTrials,
      0,
      numberOfTrials - 1
    );
    const leftCorrectTrialIndexes = RandomDraws.FromRangeWithoutReplacement(
      numberOfLeftCorrectTrials,
      0,
      numberOfTrials - 1
    );

    for (let i = 0; i < numberOfTrials; i++) {
      const isLure = lureTrialIndexes.includes(i);
      const isLeftCorrect = leftCorrectTrialIndexes.includes(i);
      let symbols: Array<number>;
      if (isLure) {
        /**
         * 2 unique random symbols for each top card, plus 1 for the incorrect
         * bottom card because in a lure, the incorrect card will repeat 1 of
         * the top symbols. Thus we need just one extra symbol for the bottom
         * card
         */
        symbols = RandomDraws.FromRangeWithoutReplacement(
          numberOfTopCards * 2 + 1,
          1,
          NUMBER_OF_SYMBOLS
        );
      } else {
        /**
         * 2 unique random symbols for each top card, plus 2 for the incorrect
         * bottom card
         */
        symbols = RandomDraws.FromRangeWithoutReplacement(
          numberOfTopCards * 2 + 2,
          1,
          NUMBER_OF_SYMBOLS
        );
      }

      const topCards = new Array<SymbolCard>();

      for (let j = 0; j < numberOfTopCards; j++) {
        const card: SymbolCard = {
          top: symbols[2 * j],
          bottom: symbols[2 * j + 1],
        };
        topCards.push(card);
      }

      const correctCardIndex = RandomDraws.FromRangeWithoutReplacement(
        1,
        0,
        numberOfTopCards - 1
      )[0];
      const correctCard = topCards[correctCardIndex];

      let incorrectCard: SymbolCard;
      if (!isLure) {
        incorrectCard = {
          top: symbols[2 * numberOfTopCards],
          bottom: symbols[2 * numberOfTopCards + 1],
        };
      } else {
        /**
         * the bottom card lure symbol cannot be part of the correct card
         */
        const potentialLureSymbols = topCards
          .filter((c) => c != correctCard)
          .map((c) => [c.top, c.bottom])
          .flat();
        const lureSymbolIndex = RandomDraws.FromRangeWithoutReplacement(
          1,
          0,
          potentialLureSymbols.length - 1
        )[0];
        const lureSymbol = potentialLureSymbols[lureSymbolIndex];
        incorrectCard = {
          top: lureSymbol,
          bottom: symbols[2 * numberOfTopCards],
        };
      }

      const trial: TrialConfiguration = {
        top_cards_symbols: topCards,
        bottom_cards_symbols: isLeftCorrect
          ? [correctCard, incorrectCard]
          : [incorrectCard, correctCard],
        trial_type: isLure ? "lure" : "normal",
        correct_response_index: isLeftCorrect ? 0 : 1,
      };
      trialConfigurations.push(trial);
    }

    chooseCardScene.onSetup(() => {
      orLabel.hidden = false;

      const trialConfiguration = trialConfigurations[game.trialIndex];
      const topCardsLength = trialConfiguration.top_cards_symbols.length;
      const bottomCardsLength = trialConfiguration.bottom_cards_symbols.length;

      let topInterCardMargin: number;
      switch (topCardsLength) {
        case 2:
        case 4: {
          topInterCardMargin = 200;
          break;
        }
        case 3: {
          topInterCardMargin = 100;
          break;
        }
        default: {
          throw new Error(
            "valid values for number_of_top_pairs are 2, 3, or 4 cards"
          );
        }
      }

      let topCardGrid: Grid;

      if (topCardsLength >= 1 && topCardsLength <= 3) {
        topCardGrid = new Grid({
          rows: 1,
          columns: topCardsLength,
          size: {
            width: 80 * topCardsLength + topInterCardMargin,
            height: 160,
          },
          position: { x: 200, y: 200 },
          backgroundColor: WebColors.Transparent,
          gridLineColor: WebColors.Transparent,
        });
      } else if (topCardsLength === 4) {
        topCardGrid = new Grid({
          rows: 2,
          columns: 2,
          size: {
            width: 80 * 2 + topInterCardMargin,
            height: 200 + topInterCardMargin,
          },
          position: { x: 200, y: 200 },
          backgroundColor: WebColors.Transparent,
          gridLineColor: WebColors.Transparent,
        });
      } else {
        throw new Error("invalid number_of_top_pairs");
      }
      chooseCardScene.addChild(topCardGrid);

      const bottomCardGrid = new Grid({
        rows: 1,
        columns: 2,
        size: { width: 80 * 2 + 200, height: 160 },
        position: { x: 200, y: 600 },
        backgroundColor: WebColors.Transparent,
        gridLineColor: WebColors.Transparent,
      });
      chooseCardScene.addChild(bottomCardGrid);

      function createCardShape(
        topSymbolImageNumber: number,
        bottomSymbolImageNumber: number
      ): Shape {
        const card = new Shape({
          rect: { size: { width: 80, height: 160 } },
          fillColor: WebColors.White,
          strokeColor: WebColors.Black,
          lineWidth: 2,
        });

        const topSymbol = new Sprite({
          imageName: "ss-" + topSymbolImageNumber.toString().padStart(2, "0"),
          position: { x: 0, y: -36 },
        });
        card.addChild(topSymbol);
        const bottomSymbol = new Sprite({
          imageName:
            "ss-" + bottomSymbolImageNumber.toString().padStart(2, "0"),
          position: { x: 0, y: 36 },
        });
        card.addChild(bottomSymbol);
        return card;
      }

      const topCards = new Array<Shape>();
      for (let i = 0; i < topCardsLength; i++) {
        const card = createCardShape(
          trialConfiguration.top_cards_symbols[i].top,
          trialConfiguration.top_cards_symbols[i].bottom
        );
        topCards.push(card);
        if (topCardsLength === 4) {
          topCardGrid.addAtCell(card, Math.floor(i / 2), i % 2);
        } else {
          topCardGrid.addAtCell(card, 0, i);
        }
      }

      const bottomCards = new Array<Shape>();
      for (let i = 0; i < bottomCardsLength; i++) {
        const card = createCardShape(
          trialConfiguration.bottom_cards_symbols[i].top,
          trialConfiguration.bottom_cards_symbols[i].bottom
        );

        (card.userData as bottomCardUserData) = {
          index: i,
        };
        bottomCards.push(card);
        bottomCardGrid.addAtCell(card, 0, i);
      }

      function setBottomCardsTappability(tappable: boolean): void {
        if (tappable) {
          bottomCards.forEach((card) => (card.isUserInteractionEnabled = true));
        } else {
          bottomCards.forEach(
            (card) => (card.isUserInteractionEnabled = false)
          );
        }
      }

      bottomCards.forEach((card) =>
        card.onTapDown(() => handleCardChoice(card))
      );

      function handleCardChoice(card: Shape): void {
        bottomCardGrid.hidden = true;
        topCardGrid.hidden = true;
        orLabel.hidden = true;

        Timer.stop("rt");
        setBottomCardsTappability(false);
        const response_time = Timer.elapsed("rt");
        Timer.remove("rt");

        game.addTrialData("trial_type", trialConfiguration.trial_type);
        game.addTrialData("response_time_duration_ms", response_time);
        game.addTrialData(
          "correct_response_index",
          trialConfiguration.correct_response_index
        );
        game.addTrialData(
          "user_response_index",
          (card.userData as bottomCardUserData).index
        );

        // correct_response_index and trial_type are nested in the
        // trialConfiguration, but we will expose these in a
        // different property. So, use the rest operator to remove
        // them from the trialConfiguration.
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          correct_response_index,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          trial_type,
          ...remaining_trial_configuration
        } = trialConfiguration;
        game.addTrialData("card_configuration", remaining_trial_configuration);
        game.addTrialData("quit_button_pressed", false);
        game.trialComplete();
        if (game.trialIndex < game.getParameter<number>("number_of_trials")) {
          orLabel.hidden = true;
          if (game.getParameter("interstimulus_animation")) {
            game.presentScene(chooseCardScene, afterTrialSceneTransition);
          } else {
            chooseCardScene.run(
              Action.sequence([
                Action.wait({
                  duration: game.getParameter("interstimulus_interval_ms"),
                }),
                Action.custom({
                  callback: () => {
                    game.presentScene(chooseCardScene);
                  },
                }),
              ])
            );
          }
        } else {
          questionLabel.hidden = false;
          game.removeFreeEntity("questionLabelFree");
          game.presentScene(doneScene, afterTrialSceneTransition);
        }
      }

      chooseCardScene.onAppear(() => {
        game.addTrialData(
          "activity_begin_iso8601_timestamp",
          this.beginIso8601Timestamp
        );
        game.addTrialData(
          "trial_begin_iso8601_timestamp",
          new Date().toISOString()
        );
        /** Add the question label free entity, only if not added yet */
        if (!game.entities.map((e) => e.name).includes("questionLabelFree")) {
          questionLabel.hidden = true;

          const questionLabelFree = new Label({
            name: "questionLabelFree",
            text: "Which of these matches a pair above?",
            fontSize: 22,
            preferredMaxLayoutWidth: 240,
          });
          game.addFreeEntity(questionLabelFree);
          questionLabelFree.position = { x: 200, y: 460 };
        }

        setBottomCardsTappability(true);
        Timer.start("rt");
      });
    });

    // ==================================================
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
      backgroundColor: WebColors.Black,
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

const activity = new SymbolSearch();
const session = new Session({
  activities: [activity],
  sessionCallbacks: {
    /**
     * onSessionLifecycleChange() will be called on events such
     * as when the session initialization is complete or when the
     * session ends.
     *
     * Once initialized, the below code will automatically start the session,
     * unless we're running in a mobile WebView and a manual start
     * is desired.
     */
    onSessionLifecycleChange: (ev: SessionLifecycleEvent) => {
      //#region to support m2c2kit in WebView: propagate events to native code
      if (SageResearch.contextIsWebView()) {
        SageResearch.sendEventToWebView(ev);
      }
      //#endregion
      if (ev.initialized) {
        //#region to support m2c2kit in WebView
        if (
          SageResearch.contextIsWebView() &&
          SageResearch.sessionManualStart()
        ) {
          // don't automatically start! Let the native code
          // set some game parameters and start the game
          return;
        }
        //#endregion
        session.start();
      }
      if (ev.ended) {
        console.log("session ended");
      }
    },
  },
  activityCallbacks: {
    /**
     * onActivityDataCreate() callback is where you insert code to post data
     * to an API or interop with a native function in the host app,
     * if applicable, as we do with sendEventToWebView().
     *
     * newData is the data that was just generated by the completed trial.
     * data is all the data, cumulative of all trials, that have been generated.
     *
     * We separate out newData from data in case you want to alter the execution
     * based on the most recent trial, e.g., maybe you want to stop after
     * a certain user behavior or performance threshold in the just completed
     * trial.
     *
     * activityConfiguration is the game parameters that were used.
     *
     * The schema for all of the above are in JSON Schema format.
     */
    onActivityDataCreate: (ev: ActivityDataEvent) => {
      //#region to support m2c2kit in WebView: propagate events to native code
      if (SageResearch.contextIsWebView()) {
        SageResearch.sendEventToWebView(ev);
      }
      //#endregion
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
    },
    /**
     * onActivityLifecycleChange() notifies us when an activity, such
     * as a game (assessment) or a survey, has completed. Usually, however,
     * we want to know when all the activities are done, so we'll
     * look for the session ending via onSessionLifecycleChange
     */
    onActivityLifecycleChange: (ev: ActivityLifecycleEvent) => {
      //#region to support m2c2kit in WebView: propagate events to native code
      if (SageResearch.contextIsWebView()) {
        SageResearch.sendEventToWebView(ev);
      }
      //#endregion
      if (ev.ended || ev.canceled) {
        const status = ev.ended ? "ended" : "canceled";
        console.log(`${status} activity ${ev.name}`);
        if (session.nextActivity) {
          session.advanceToNextActivity();
        } else {
          session.end();
        }
      }
    },
  },
});

/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or a mobile WebView's invocation of session.start().
 * */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
SageResearch.ConfigureWasmFetchInterceptor();
session.init().then(() => {
  /**
   * session.init() may take a few moments when downloading non-local or
   * non-cached resources. After session.init() completes, the below code
   * removes the loading spinner that is defined in the HTML template.
   */
  const loaderDiv = document.getElementById("m2c2kit-loader-div");
  if (loaderDiv) {
    loaderDiv.classList.remove("m2c2kit-loader");
  }
});
