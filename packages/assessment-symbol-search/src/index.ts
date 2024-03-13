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
  Sprite,
  Easings,
  Constants,
} from "@m2c2kit/core";
import { Button, Grid, Instructions, CountdownScene } from "@m2c2kit/addons";

/**
 * Symbol Search is a speeded continuous performance test of conjunctive
 * feature search in which respondents identify matching symbol pairs as
 * quickly and as accurately as they can.
 */
class SymbolSearch extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * Each game parameter should have a type, default (this is the default
     * value), and a description.
     */
    const defaultParameters: GameParameters = {
      number_of_top_pairs: {
        default: 3,
        type: "integer",
        enum: [1, 2, 3, 4],
        description: "Number of pairs to be shown on top. (1-4)",
      },
      lure_percent: {
        default: 0.5,
        type: "number",
        description:
          "Percentage of lure trials. Number from 0 to 1. A lure trial is \
when the incorrect symbol pair on the bottom contains exactly one symbol \
that is found on the top.(1 unique symbol). A non-lure trial is when the \
incorrect symbol pair contains exactly zero symbols that match the \
top. (2 unique symbols.)",
      },
      lure_position_on_card: {
        default: "either",
        type: "string",
        enum: ["top", "bottom", "either"],
        description:
          "If a lure trial, must the lure symbol occupy the top position \
on the the card, the bottom, or either? If either, then the lure symbol \
will be equally distributed across trials to be in the top and bottom \
positions.",
      },
      left_correct_percent: {
        default: 0.5,
        type: "number",
        description:
          "Percentage of trials where the left pair is the correct answer. Number from 0 to 1.",
      },
      preparation_duration_ms: {
        default: 3000,
        type: "number",
        description:
          "Duration of the preparation phase ('get ready' countdown, milliseconds). Multiples of 1000 recommended.",
      },
      after_preparation_transition_duration_ms: {
        default: 500,
        type: "number",
        description:
          "Duration, in milliseconds, of the slide in animation after the preparation phase.",
      },
      number_of_trials: {
        default: 5,
        type: "integer",
        description: "How many trials to run.",
      },
      interstimulus_animation: {
        default: true,
        type: "boolean",
        description: "Should new trials slide in from right to left?",
      },
      interstimulus_interval_duration_ms: {
        default: 500,
        type: "number",
        description:
          "If interstimulus_animation == true, the duration, in milliseconds, of the slide in animation after each trial. Otherwise, the duration, in milliseconds, to wait after a trial has been completed until a new trial appears.",
      },
      instruction_type: {
        default: "long",
        type: "string",
        enum: ["short", "long"],
        description: "Type of instructions to show, 'short' or 'long'.",
      },
      show_trials_complete_scene: {
        default: true,
        type: "boolean",
        description:
          "After the final trial, should a completion scene be shown? Otherwise, the game will immediately end.",
      },
      trials_complete_scene_text: {
        default: "You have completed all the symbol search trials",
        type: "string",
        description: "Text for scene displayed after all trials are complete.",
      },
      trials_complete_scene_button_text: {
        default: "OK",
        type: "string",
        description:
          "Button text for scene displayed after all trials are complete.",
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
      trial_end_iso8601_timestamp: {
        type: ["string", "null"],
        format: "date-time",
        description:
          "ISO 8601 timestamp at the end of the trial (when user selects a card). Null if trial was skipped.",
      },
      trial_index: {
        type: ["integer", "null"],
        description: "Index of the trial within this assessment, 0-based.",
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
      version: "__PACKAGE_JSON_VERSION__",
      moduleMetadata: Constants.MODULE_METADATA_PLACEHOLDER,
      shortDescription:
        "Symbol Search is a speeded continuous performance test of \
conjunctive feature search in which respondents identify matching symbol \
pairs as quickly and as accurately as they can.",
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
      showFps: defaultParameters.show_fps.default,
      width: 400,
      height: 800,
      trialSchema: symbolSearchTrialSchema,
      parameters: defaultParameters,
      fonts: [
        {
          fontName: "roboto",
          url: "fonts/roboto/Roboto-Regular.ttf",
        },
      ],
      bodyBackgroundColor: WebColors.White,
      images: [
        {
          imageName: "gameImage",
          height: 340,
          width: 255,
          url: "images/gameImage.png",
        },
        {
          imageName: "gameImageOutlinedCards",
          height: 340,
          width: 255,
          url: "images/gameImageOutlinedCards.png",
        },
        {
          imageName: "stopwatchImage",
          height: 319,
          width: 256,
          // license is public domain
          // https://commons.wikimedia.org/wiki/File:Dtjohnnymonkey-Stopwatch-no-shading.svg
          url: "images/stopwatch.svg",
        },
        {
          imageName: "ssintroImage",
          height: 186,
          width: 336,
          url: "images/ssintroImage.png",
        },
        // NOTE: names of symbols must be in form of ss-01, starting
        // at ss-01, not ss-00.
        {
          imageName: "ss-01",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-01.svg",
        },
        {
          imageName: "ss-02",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-02.svg",
        },
        {
          imageName: "ss-03",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-03.svg",
        },
        {
          imageName: "ss-04",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-04.svg",
        },
        {
          imageName: "ss-05",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-05.svg",
        },
        {
          imageName: "ss-06",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-06.svg",
        },
        {
          imageName: "ss-07",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-07.svg",
        },
        {
          imageName: "ss-08",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-08.svg",
        },
        {
          imageName: "ss-09",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-09.svg",
        },
        {
          imageName: "ss-10",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-10.svg",
        },
        {
          imageName: "ss-11",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-11.svg",
        },
        {
          imageName: "ss-12",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-12.svg",
        },
        {
          imageName: "ss-13",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-13.svg",
        },
        {
          imageName: "ss-14",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-14.svg",
        },
        {
          imageName: "ss-15",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-15.svg",
        },
        {
          imageName: "ss-16",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-16.svg",
        },
        {
          imageName: "ss-17",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-17.svg",
        },
        {
          imageName: "ss-18",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-18.svg",
        },
        {
          imageName: "ss-19",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-19.svg",
        },
        {
          imageName: "ss-20",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-20.svg",
        },
        {
          imageName: "ss-21",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-21.svg",
        },
        {
          imageName: "ss-22",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-22.svg",
        },
        {
          imageName: "ss-23",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-23.svg",
        },
        {
          imageName: "ss-24",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "images/ss-24.svg",
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

    // these are defined in game options images
    const NUMBER_OF_SYMBOLS = 24;

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

    // ==================================================
    // SCENES: instructions

    let instructionsScenes: Array<Scene>;

    /**
     * sharedInstructionsOptions are what is the the same for short
     * and long instructions
     */
    const sharedInstructionsOptions = {
      backgroundColor: WebColors.White,
      nextButtonBackgroundColor: WebColors.Black,
      backButtonBackgroundColor: WebColors.Black,
      nextSceneTransition: Transition.slide({
        direction: TransitionDirection.Left,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      }),
      backSceneTransition: Transition.slide({
        direction: TransitionDirection.Right,
        duration: 500,
        easing: Easings.sinusoidalInOut,
      }),
    };

    switch (game.getParameter("instruction_type")) {
      case "short": {
        instructionsScenes = Instructions.create({
          ...sharedInstructionsOptions,
          instructionScenes: [
            {
              title: "Symbol Search",
              text: "Goal: Touch the set on the bottom that is exactly the same as a set above, as fast and accurately as you can.",
              imageName: "ssintroImage",
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
        instructionsScenes = Instructions.create({
          ...sharedInstructionsOptions,
          instructionScenes: [
            {
              title: "Symbol Search",
              text: "You will see sets of symbols on the top and bottom of the screen.",
              imageName: "gameImage",
              imageAboveText: false,
              imageMarginTop: 12,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.25,
            },
            {
              title: "Symbol Search",
              text: "When prompted, touch the set on the bottom that is exactly the same as a set above.",
              imageName: "gameImageOutlinedCards",
              imageAboveText: false,
              imageMarginTop: 12,
              textFontSize: 24,
              titleFontSize: 30,
              textVerticalBias: 0.25,
            },
            {
              title: "Symbol Search",
              text: "Please be as fast and accurate as you can.",
              imageName: "stopwatchImage",
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
            "instruction_type",
          )}`,
        );
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

    const afterTrialSceneTransition = Transition.slide({
      direction: TransitionDirection.Left,
      duration: game.getParameter("interstimulus_interval_duration_ms"),
      easing: Easings.sinusoidalInOut,
    });

    // ==================================================
    // SCENE: countdownScene

    const countdownScene = new CountdownScene({
      milliseconds: game.getParameter<number>("preparation_duration_ms"),
      text: "GET READY!",
      transitionDurationMilliseconds: game.getParameter(
        "after_preparation_transition_duration_ms",
      ),
    });
    game.addScene(countdownScene);

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
      "left_correct_percent",
    );
    const numberOfTopCards = game.getParameter<number>("number_of_top_pairs");
    // TODO: allow number of bottom cards to be configurable
    // const numberOfBottomCards = 2;
    const numberOfLureTrials = Math.round(numberOfTrials * lurePercent);
    const numberOfLeftCorrectTrials = Math.round(
      numberOfTrials * leftCorrectPercent,
    );
    const lureTrialIndexes = RandomDraws.FromRangeWithoutReplacement(
      numberOfLureTrials,
      0,
      numberOfTrials - 1,
    );
    const leftCorrectTrialIndexes = RandomDraws.FromRangeWithoutReplacement(
      numberOfLeftCorrectTrials,
      0,
      numberOfTrials - 1,
    );
    /**
     * For each lure trial, we need to know if the lure symbol should occupy
     * the top or bottom position on the card. We will pop from this array as
     * we create lure trials. top = position 0, bottom = position 1
     */
    let lurePositions: Array<number>;
    switch (game.getParameter<string>("lure_position_on_card")) {
      case "top": {
        lurePositions = Array(numberOfLureTrials).fill(0);
        break;
      }
      case "bottom": {
        lurePositions = Array(numberOfLureTrials).fill(1);
        break;
      }
      case "either": {
        const numberOfTopLurePositions = Math.round(numberOfLureTrials / 2);
        lurePositions = [
          ...Array(numberOfTopLurePositions).fill(0),
          ...Array(numberOfLureTrials - numberOfTopLurePositions).fill(1),
        ];
        lurePositions = this.shuffleArray(lurePositions);
        break;
      }
      default: {
        throw new Error(
          `invalid value for lure_position_on_card: ${game.getParameter(
            "lure_position_on_card",
          )}`,
        );
      }
    }

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
          NUMBER_OF_SYMBOLS,
        );
      } else {
        /**
         * 2 unique random symbols for each top card, plus 2 for the incorrect
         * bottom card
         */
        symbols = RandomDraws.FromRangeWithoutReplacement(
          numberOfTopCards * 2 + 2,
          1,
          NUMBER_OF_SYMBOLS,
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
        numberOfTopCards - 1,
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
          potentialLureSymbols.length - 1,
        )[0];
        const lureSymbol = potentialLureSymbols[lureSymbolIndex];

        const lurePosition = lurePositions.shift();
        if (lurePosition === undefined) {
          throw new Error("lurePositions is empty");
        }
        // top = position 0, bottom = position 1
        if (lurePosition === 0) {
          incorrectCard = {
            top: lureSymbol,
            bottom: symbols[2 * numberOfTopCards],
          };
        } else {
          incorrectCard = {
            top: symbols[2 * numberOfTopCards],
            bottom: lureSymbol,
          };
        }
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
            "valid values for number_of_top_pairs are 2, 3, or 4 cards",
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
        bottomSymbolImageNumber: number,
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
          trialConfiguration.top_cards_symbols[i].bottom,
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
          trialConfiguration.bottom_cards_symbols[i].bottom,
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
            (card) => (card.isUserInteractionEnabled = false),
          );
        }
      }

      bottomCards.forEach((card) =>
        card.onTapDown(() => handleCardChoice(card)),
      );

      function handleCardChoice(card: Shape): void {
        bottomCardGrid.hidden = true;
        topCardGrid.hidden = true;
        orLabel.hidden = true;

        Timer.stop("rt");
        setBottomCardsTappability(false);
        const response_time = Timer.elapsed("rt");
        Timer.remove("rt");

        game.addTrialData(
          "trial_end_iso8601_timestamp",
          new Date().toISOString(),
        );
        game.addTrialData("trial_type", trialConfiguration.trial_type);
        game.addTrialData("response_time_duration_ms", response_time);
        game.addTrialData(
          "correct_response_index",
          trialConfiguration.correct_response_index,
        );
        game.addTrialData(
          "user_response_index",
          (card.userData as bottomCardUserData).index,
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
        game.addTrialData("trial_index", game.trialIndex);
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
              ]),
            );
          }
        } else {
          questionLabel.hidden = false;
          game.removeFreeNode("questionLabelFree");
          if (game.getParameter("show_trials_complete_scene")) {
            game.presentScene(doneScene, afterTrialSceneTransition);
          } else {
            game.end();
          }
        }
      }

      chooseCardScene.onAppear(() => {
        game.addTrialData(
          "activity_begin_iso8601_timestamp",
          this.beginIso8601Timestamp,
        );
        game.addTrialData(
          "trial_begin_iso8601_timestamp",
          new Date().toISOString(),
        );
        /** Add the question label free node, only if not added yet */
        if (!game.nodes.map((e) => e.name).includes("questionLabelFree")) {
          questionLabel.hidden = true;

          const questionLabelFree = new Label({
            name: "questionLabelFree",
            text: "Which of these matches a pair above?",
            fontSize: 22,
            preferredMaxLayoutWidth: 240,
          });
          game.addFreeNode(questionLabelFree);
          questionLabelFree.position = { x: 200, y: 460 };
        }

        setBottomCardsTappability(true);
        Timer.start("rt");
      });
    });

    // ==================================================
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
      game.removeAllFreeNodes();
    });
  }

  /**
   * Returns a new array with the items in random order.
   *
   * @param array - The array to shuffle
   * @returns A new array with the items in random order
   */
  private shuffleArray<T>(array: T[]) {
    // Create a copy of the original array to avoid mutating it
    const copy = [...array];
    const shuffled = [];
    while (copy.length > 0) {
      // Generate a random index between 0 and the length of the copy array
      const index = Math.floor(Math.random() * copy.length);
      // Remove the item at the random index from the copy array and push it to the shuffled array
      shuffled.push(copy.splice(index, 1)[0]);
    }
    return shuffled;
  }
}

export { SymbolSearch };
