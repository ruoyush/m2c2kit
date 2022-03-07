import {
  Game,
  Action,
  Scene,
  Shape,
  Size,
  Point,
  Label,
  Transition,
  TransitionDirection,
  WebColors,
  Rect,
  RandomDraws,
  LabelHorizontalAlignmentMode,
  GameParameters,
  GameOptions,
  TrialSchema,
  Timer,
  Session,
  EventBase,
  EventType,
  SessionLifecycleEvent,
  ActivityDataEvent,
  ActivityLifecycleEvent,
  Entity,
  Sprite,
  EntityType,
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class SymbolSearch extends Game {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * At run time, they can be changed with the setParameters() method.
     */
    const defaultParameters: GameParameters = {
      match_pairs_top: {
        value: 3,
        description: "Number of pairs to be shown on top. (1-4)",
      },
      // QUESTION: CAN THE LURE SYMBOL BE PART OF THE CORRECT CARD?
      lure_percent: {
        value: 0,
        description:
          "Percentage of lure trials. A lure trial is when the \
incorrect symbol pair on the bottom contains exactly one symbol that \
is found on the top.(1 unique symbol). A non-lure trial is when the \
incorrect symbol pair contains exactly zero symbols that match the \
top.(2 unique symbols.)",
      },
      left_correct_percent: {
        value: 0.5,
        description:
          "Percentage of trials where the left pair is the correct answer. Number from 0 to 1.",
      },
      countdown_time: {
        value: 3000,
        description:
          "How long is the 'get ready' countdown, milliseconds. Multiples of 1000 recommended",
      },
      number_of_trials: {
        value: 5,
        description: "How many trials to run. Integer.",
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
    const symbolSearchTrialSchema: TrialSchema = {
      trial_type: {
        type: "string",
        description: "possible values are 'normal' or 'lure'",
      },
      response_time: {
        type: "number",
        description:
          "milliseconds from the beginning of the trial until a user taps a response",
      },
      user_response: {
        type: "number",
        description: "user selected response, 0 = left side, 1 = right side",
      },
      correct_response: {
        type: "number",
        description:
          "correct response, 0 = left side, 1 = right side. \
The selection the user should have made in order to be correct. The correct \
response was given for a trial if user_response == correct_response.",
      },
    };

    const symbol_image_size = 160;

    const options: GameOptions = {
      name: "Symbol Search",
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
      showFps: true,
      width: 400,
      height: 800,
      trialSchema: symbolSearchTrialSchema,
      parameters: defaultParameters,
      fontUrls: ["./fonts/roboto/Roboto-Regular.ttf"],
      bodyBackgroundColor: WebColors.White,
      images: [
        {
          name: "gameImage",
          height: 274,
          width: 280,
          url: "img/gameImage.svg",
        },
        {
          name: "gameImageOutlinedCards",
          height: 274,
          width: 280,
          url: "img/gameImageOutlinedCards.svg",
        },
        {
          name: "stopwatchImage",
          height: 250,
          width: 360,
          url: "img/stopwatchImage.svg",
        },
        {
          name: "ssintroImage",
          height: 190,
          width: 360,
          url: "img/ssintroImage.svg",
        },
        {
          name: "ss-01",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-01.svg",
        },
        {
          name: "ss-02",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-02.svg",
        },
        {
          name: "ss-03",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-03.svg",
        },
        {
          name: "ss-04",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-04.svg",
        },
        {
          name: "ss-05",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-05.svg",
        },
        {
          name: "ss-06",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-06.svg",
        },
        {
          name: "ss-07",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-07.svg",
        },
        {
          name: "ss-08",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-08.svg",
        },
        {
          name: "ss-09",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-09.svg",
        },
        {
          name: "ss-10",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-10.svg",
        },
        {
          name: "ss-11",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-11.svg",
        },
        {
          name: "ss-12",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-12.svg",
        },
        {
          name: "ss-13",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-13.svg",
        },
        {
          name: "ss-14",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-14.svg",
        },
        {
          name: "ss-15",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-15.svg",
        },
        {
          name: "ss-16",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-16.svg",
        },
        {
          name: "ss-17",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-17.svg",
        },
        {
          name: "ss-18",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-18.svg",
        },
        {
          name: "ss-19",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-19.svg",
        },
        {
          name: "ss-20",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-20.svg",
        },
        {
          name: "ss-21",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-21.svg",
        },
        {
          name: "ss-22",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-22.svg",
        },
        {
          name: "ss-23",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-23.svg",
        },
        {
          name: "ss-24",
          height: symbol_image_size,
          width: symbol_image_size,
          url: "img/ss-24.svg",
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

    // ==================================================
    // SCENES: instructions
    const instructionsScenes = Instructions.Create({
      sceneNamePrefix: "instructions",
      backgroundColor: WebColors.White,
      nextButtonBackgroundColor: WebColors.Black,
      backButtonBackgroundColor: WebColors.Black,
      instructionScenes: [
        {
          title: "Activity: Symbol Search",
          text: "You will see sets of symbols on the top and bottom of the screen.",
          image: "gameImage",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Activity: Symbol Search",
          text: "When prompted, touch the set on the bottom that is exactly the same as a set above.",
          image: "gameImageOutlinedCards",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Activity: Symbol Search",
          text: "Please be as fast and accurate as you can",
          image: "stopwatchImage",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Activity: Symbol Search",
          text: "Goal: Touch the set on the bottom that is exactly the same as a set above, as fast and accurate as you can.",
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
      postInstructionsScene: "countdownScene",
    });
    game.addScenes(instructionsScenes);

    const nextScreenTransition = Transition.push(TransitionDirection.left, 500);

    // ==================================================
    // SCENE: countdownScene

    const countdownScene = new Scene({
      name: "countdownScene",
      backgroundColor: [255, 255, 255, 1],
    });
    game.addScene(countdownScene);

    const countdownCircle = new Shape({
      circleOfRadius: 100,
      position: new Point(200, 350),
      fillColor: [44, 90, 255, 1],
    });

    countdownScene.addChild(countdownCircle);

    const countdownInitialNumber = Math.floor(
      game.getParameter<number>("countdown_time") / 1000
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
      position: new Point(200, 500),
    });
    countdownScene.addChild(getreadyLabel);

    countdownScene.onAppear(() => {
      const countdownSequence = new Array<Action>();

      for (let i = countdownInitialNumber - 1; i > 0; i--) {
        countdownSequence.push(Action.Wait({ duration: 1000 }));
        countdownSequence.push(
          Action.Custom({
            callback: () => {
              countdownNumber.text = i.toString();
            },
          })
        );
      }

      countdownSequence.push(Action.Wait({ duration: 1000 }));
      countdownSequence.push(
        Action.Custom({
          callback: () => {
            game.presentScene(
              chooseCardScene,
              Transition.push(TransitionDirection.left, 500)
            );
          },
        })
      );
      countdownScene.run(Action.Sequence(countdownSequence));

      // below is the original code, showing hard-coded countdown
      // countdownScene.run(
      //   Action.Sequence([
      //     Action.Wait({ duration: 1000 }),
      //     Action.Custom({
      //       callback: () => {
      //         countdownNumber.text = "2";
      //       },
      //     }),
      //     Action.Wait({ duration: 1000 }),
      //     Action.Custom({
      //       callback: () => {
      //         countdownNumber.text = "1";
      //       },
      //     }),
      //     Action.Wait({ duration: 1000 }),
      //     Action.Custom({
      //       callback: () => {
      //         game.presentScene(
      //           chooseCardScene,
      //           Transition.push(TransitionDirection.left, 500)
      //         );
      //       },
      //     }),
      //   ])
      // );
    });

    // ==================================================
    // SCENE: chooseCardScene

    const chooseCardScene = new Scene({
      name: "chooseCardScene",
      backgroundColor: [169, 201, 219, 1],
    });
    game.addScene(chooseCardScene);

    const bottomBackground = new Shape({
      rect: new Rect({ size: new Size(400, 400) }),
      fillColor: [166, 177, 181, 1],
      position: new Point(200, 600),
    });
    chooseCardScene.addChild(bottomBackground);

    const questionLabel = new Label({
      text: "Which of these matches a pair above?",
      fontSize: 22,
      preferredMaxLayoutWidth: 240,
    });
    chooseCardScene.addChild(questionLabel);
    questionLabel.position = new Point(200, 460);

    const orLabel = new Label({
      text: "or",
      fontSize: 22,
      preferredMaxLayoutWidth: 240,
    });
    chooseCardScene.addChild(orLabel);
    orLabel.position = new Point(200, 580);

    chooseCardScene.onSetup(() => {
      const matchPairsTop = game.getParameter<number>("match_pairs_top");

      let topInterCardMargin: number;
      switch (matchPairsTop) {
        case 2: {
          topInterCardMargin = 200;
          break;
        }
        case 3: {
          topInterCardMargin = 100;
          break;
        }
        case 4: {
          topInterCardMargin = 50;
          break;
        }
        default: {
          throw new Error(
            "valid values for match_pairs_top are 2, 3, or 4 cards"
          );
        }
      }

      const topCardGrid = new Grid({
        rows: 1,
        columns: matchPairsTop,
        size: new Size(80 * matchPairsTop + topInterCardMargin, 160),
        position: new Point(200, 200),
        backgroundColor: WebColors.Transparent,
        gridLineColor: WebColors.Transparent,
      });
      chooseCardScene.addChild(topCardGrid);

      const bottomCardGrid = new Grid({
        rows: 1,
        columns: 2,
        size: new Size(80 * 2 + 200, 160),
        position: new Point(200, 600),
        backgroundColor: WebColors.Transparent,
        gridLineColor: WebColors.Transparent,
      });
      chooseCardScene.addChild(bottomCardGrid);

      const isLureTrial = Math.random() < 0.5;
      let randomSymbolNumbers: number[];

      if (!isLureTrial) {
        // 2 unique random symbols for each top card, plus 2 for the incorrect
        // bottom card
        randomSymbolNumbers = RandomDraws.FromRangeWithoutReplacement(
          matchPairsTop * 2 + 2,
          1,
          NUMBER_OF_SYMBOLS
        );
      } else {
        // 2 unique random symbols for each top card, plus 1 for the incorrect
        // bottom card because in a lure, the incorrect card will repeat 1 of
        // the top symbols. Thus we need just one extra symbol for the bottom
        // card
        randomSymbolNumbers = RandomDraws.FromRangeWithoutReplacement(
          matchPairsTop * 2 + 1,
          1,
          NUMBER_OF_SYMBOLS
        );
      }

      function createCardShape(
        topSymbolImageNumber: number,
        bottomSymbolImageNumber: number
      ): Shape {
        const card = new Shape({
          rect: { size: new Size(80, 160) },
          fillColor: WebColors.White,
          strokeColor: WebColors.Black,
          lineWidth: 2,
        });

        const topSymbol = new Sprite({
          imageName: "ss-" + topSymbolImageNumber.toString().padStart(2, "0"),
          position: new Point(0, -36),
        });
        card.addChild(topSymbol);
        const bottomSymbol = new Sprite({
          imageName:
            "ss-" + bottomSymbolImageNumber.toString().padStart(2, "0"),
          position: new Point(0, 36),
        });
        card.addChild(bottomSymbol);
        return card;
      }

      const topCards = new Array<Entity>();
      for (let i = 0; i < matchPairsTop; i++) {
        const card = createCardShape(
          randomSymbolNumbers[i * 2],
          randomSymbolNumbers[i * 2 + 1]
        );
        topCards.push(card);
        topCardGrid.addAtCell(card, 0, i);
      }

      let incorrectCard: Shape;

      if (isLureTrial) {
        // in a lure trial, the "incorrect symbol pair on the bottom contains exactly one symbol that is found on the top"
        const lureRandomSymbolIndex = RandomDraws.SingleFromRange(
          1,
          randomSymbolNumbers.length - 1
        );
        const isLureSymbolOnTop = Math.random() < 0.5;

        if (isLureSymbolOnTop) {
          incorrectCard = createCardShape(
            randomSymbolNumbers[lureRandomSymbolIndex],
            randomSymbolNumbers[randomSymbolNumbers.length - 1]
          );
        } else {
          incorrectCard = createCardShape(
            randomSymbolNumbers[randomSymbolNumbers.length - 1],
            randomSymbolNumbers[lureRandomSymbolIndex]
          );
        }
      } else {
        incorrectCard = createCardShape(
          randomSymbolNumbers[randomSymbolNumbers.length - 1],
          randomSymbolNumbers[randomSymbolNumbers.length - 2]
        );
      }

      const correctCardIndex = RandomDraws.SingleFromRange(
        0,
        matchPairsTop - 1
      );
      const correctCard = topCards[correctCardIndex].duplicate<Shape>();

      const isLeftCardCorrect =
        Math.random() < game.getParameter<number>("left_correct_percent");
      if (isLeftCardCorrect) {
        bottomCardGrid.addAtCell(correctCard, 0, 0);
        bottomCardGrid.addAtCell(incorrectCard, 0, 1);
      } else {
        bottomCardGrid.addAtCell(correctCard, 0, 1);
        bottomCardGrid.addAtCell(incorrectCard, 0, 0);
      }

      function setBottomCardsTappability(tappable: boolean): void {
        if (tappable) {
          correctCard.isUserInteractionEnabled = true;
          incorrectCard.isUserInteractionEnabled = true;
        } else {
          correctCard.isUserInteractionEnabled = false;
          incorrectCard.isUserInteractionEnabled = false;
        }
      }

      correctCard.onTapDown(() => {
        handleCardChoice(true);
      });

      incorrectCard.onTapDown(() => {
        handleCardChoice(false);
      });

      function handleCardChoice(correct: boolean): void {
        Timer.stop("rt");
        setBottomCardsTappability(false);
        const response_time = Timer.elapsed("rt");
        Timer.remove("rt");

        game.addTrialData("trial_type", isLureTrial ? "lure" : "normal");
        game.addTrialData("response_time", response_time);
        game.addTrialData("correct_response", isLeftCardCorrect ? 0 : 1);
        if (isLeftCardCorrect) {
          if (correct) {
            game.addTrialData("user_response", 0);
          } else {
            game.addTrialData("user_response", 1);
          }
        } else {
          if (correct) {
            game.addTrialData("user_response", 1);
          } else {
            game.addTrialData("user_response", 0);
          }
        }
        game.trialComplete();
        if (game.trialIndex < game.getParameter<number>("number_of_trials")) {
          game.presentScene(chooseCardScene, nextScreenTransition);
        } else {
          game.presentScene(doneScene, nextScreenTransition);
        }
      }

      chooseCardScene.onAppear(() => {
        setBottomCardsTappability(true);
        Timer.start("rt");
      });
    });

    // ==================================================
    // SCENE: done scene
    const doneScene = new Scene();
    game.addScene(doneScene);

    const exitButton = new Button({
      text: "Done",
      position: new Point(200, 600),
      backgroundColor: WebColors.Black,
    });
    exitButton.isUserInteractionEnabled = true;
    exitButton.onTapDown(() => {
      // don't allow repeat taps of exit button
      exitButton.isUserInteractionEnabled = false;
      exitButton.hidden = true;
      game.end();
    });
    doneScene.addChild(exitButton);

    switch (game.getParameter("instruction_type")) {
      case "short": {
        /**
         * For short instructuions, start at scene 4 and disable the
         * back button
         */
        game.entryScene = "instructions-04";
        const shortScene = game.entities
          .filter((e) => e.name === "instructions-04")
          .find(Boolean);
        const backButton = shortScene?.descendants
          .filter(
            (e) =>
              e.type === EntityType.composite && (e as Button).text === "Back"
          )
          .find(Boolean);
        if (backButton) {
          backButton.hidden = true;
        }
        console.log(shortScene);
        break;
      }
      case "long": {
        game.entryScene = "instructions-01";
        break;
      }
      default: {
        throw new Error("invalid value for instruction_type");
      }
    }

    game.entryScene = "instructions-01";
    if (game.getParameter("instruction_type") == "short") {
      game.entryScene = "instructions-04";
    }
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

const symbolSearch = new SymbolSearch();
// default InterferenceTime is 8000 ms; this is how we can specify a different
// value (6000) from within JavaScript. See the Android code for how we can
// specify values from native code
//symbolSearch.setParameters({ });

const session = new Session({
  activities: [symbolSearch],
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

// This is an example of how to change game parameters; default is
// 3 pairs on top, but I'm setting it to 4.
session.options.activities[0].setParameters({ match_pairs_top: 4 });
session.init();