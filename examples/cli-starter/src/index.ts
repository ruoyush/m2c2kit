import {
  Game,
  Action,
  Scene,
  Label,
  WebColors,
  RandomDraws,
  GameParameters,
  GameOptions,
  TrialSchema,
  Timer,
  Session,
  SessionLifecycleEvent,
  ActivityDataEvent,
  ActivityLifecycleEvent,
  RgbaColor,
} from "@m2c2kit/core";
import { Button, Instructions } from "@m2c2kit/addons";

class CliStarter extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * Each game parameter should have a type, a value (this is the default
     * value), and a description.
     */
    const defaultParameters: GameParameters = {
      preparation_duration_ms: {
        type: "number",
        value: 500,
        description: "How long the 'get ready' message is shown, milliseconds.",
      },
      number_of_trials: {
        type: "integer",
        value: 5,
        description: "How many trials to run.",
      },
      show_fps: {
        type: "boolean",
        value: true,
        description: "Should the FPS be shown?",
      },
    };

    /**
     * This describes all the data that will be generated by the assessment
     * in a single trial. Each variable should have a type and description.
     * If a variable might be null, the type can be an array:
     *   type: ["string", "null"]
     * Object and array types are also allowed, but this example uses only
     * simple types.
     *
     * More advanced schema parameters such as format or enum are optional.
     *
     * At runtime, when a trial completes, the data will be returned to the
     * session with a callback, along with this schema transformed into
     * JSON Schema.
     */
    const gridMemoryTrialSchema: TrialSchema = {
      presented_word_text: {
        type: "string",
        description: "The text that was presented.",
      },
      presented_word_color: {
        type: "string",
        description: "The color of the text that was presented.",
      },
      selected_text: {
        type: "string",
        description: "The text that was selected by the user.",
      },
      selection_correct: {
        type: "boolean",
        description: "Was the text selected correctly?",
      },
      response_time_ms: {
        type: "number",
        description:
          "How long, in milliseconds, from when the word was presented until the user made a selection.",
      },
    };

    const options: GameOptions = {
      name: "cli starter assessment",
      id: "cli-starter",
      version: "1.0.0",
      shortDescription:
        "A starter assessment created by the m2c2kit cli demonstrating the Stroop effect.",
      longDescription: `In psychology, the Stroop effect is the delay in \
reaction time between congruent and incongruent stimuli. The effect has \
been used to create a psychological test (the Stroop test) that is widely \
used in clinical practice and investigation. A basic task that demonstrates \
this effect occurs when there is a mismatch between the name of a color \
(e.g., "blue", "green", or "red") and the color it is printed on (i.e., the \
word "red" printed in blue ink instead of red ink). When asked to name the \
color of the word it takes longer and is more prone to errors when the color \
of the ink does not match the name of the color. The effect is named after \
John Ridley Stroop, who first published the effect in English in 1935. The \
effect had previously been published in Germany in 1929 by other authors. \
The original paper by Stroop has been one of the most cited papers in the \
history of experimental psychology, leading to more than 700 Stroop-related \
articles in literature. Source: https://en.wikipedia.org/wiki/Stroop_effect`,
      uri: "An external link to your assessment repository or informational website.",
      showFps: defaultParameters.show_fps.value,
      /**
       * Actual pixel resolution will be scaled to fit the device, while
       * preserving the aspect ratio. It is important, however, to specify
       * a width and height to obtain the desired aspect ratio. In most
       * cases, you should not change this. 1:2 is a good aspect ratio
       * for modern phones.
       */
      width: 400,
      height: 800,
      trialSchema: gridMemoryTrialSchema,
      parameters: defaultParameters,
      /**
       * IMPORTANT: fontUrls must be an array of string literals. If you
       * use anything else, the cache busting functionality will not work
       * when building for production. The following are examples of what
       * should NOT be used, even though they are syntactically correct:
       *
       *   fontUrls: ["assets/cli-starter/" + "fonts/roboto/Roboto-Regular.ttf"]
       *
       *   const prefix = "assets/cli-starter/";
       *   ...
       *   fontUrls: [prefix + "fonts/roboto/Roboto-Regular.ttf"]
       */
      /**
       * The Roboto-Regular.ttf font is licensed under the Apache License,
       * and its LICENSE.TXT will be copied as part of the build.
       */
      fontUrls: ["assets/cli-starter/fonts/roboto/Roboto-Regular.ttf"],
      /**
       * IMPORTANT: Similar to fontUrls, the url for an image must be
       * a string literal.
       */
      images: [
        {
          name: "assessmentImage",
          /**
           * The image will be resized to the height and width specified.
           */
          height: 441,
          width: 255,
          /**
           * The image url must match the location of the image under the
           * src folder.
           */
          url: "assets/cli-starter/img/assessmentExample.png",
        },
      ],
    };

    super(options);
  }

  override init(): void {
    /**
     * Just for convenience, alias the variable game to "this"
     * (even though eslint doesn't like it)
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    // ==============================================================
    /**
     * Create the trial configuration of all trials.
     * It is often necessary to create the full trial configuration before
     * starting any trials. For example, in the stroop task, one could
     * add game parameters to specify a certain percent of the correct
     * responses are the left versus right buttons. Or, one might want an
     * equal number of trials for each font color.
     */

    interface StroopColor {
      name: string;
      rgba: RgbaColor;
    }

    /**
     * These are the colors that will be used in the game.
     */
    const stroopColors: StroopColor[] = [
      { name: "Red", rgba: [255, 0, 0, 1] },
      { name: "Green", rgba: [0, 255, 0, 1] },
      { name: "Blue", rgba: [0, 0, 255, 1] },
      { name: "Orange", rgba: [255, 165, 0, 1] },
    ];

    /**
     * This completely describes the configuration of single trial.
     */
    interface TrialConfiguration {
      presented_text: string;
      presented_color: StroopColor;
      selection_options_text: string[];
      correct_option_index: number;
    }

    const trialConfigurations: TrialConfiguration[] = [];

    /**
     * Note: TypeScript will try to infer the type of the game parameter that
     * you request in game.getParameter(). If the type cannot be inferred, you
     * will get a compiler error, and you must specify the type, as in the
     * next statement.
     */
    for (let i = 0; i < game.getParameter<number>("number_of_trials"); i++) {
      const presentedTextIndex = RandomDraws.SingleFromRange(
        0,
        stroopColors.length - 1
      );
      const presentedColorIndex = RandomDraws.SingleFromRange(
        0,
        stroopColors.length - 1
      );

      const selection_options_text = new Array<string>();
      const firstIsCorrect = RandomDraws.SingleFromRange(0, 1);
      let correctOptionIndex;

      if (firstIsCorrect === 1) {
        correctOptionIndex = 0;
        selection_options_text.push(stroopColors[presentedColorIndex].name);
        const remainingColors = stroopColors.filter(
          (c) => c.name !== stroopColors[presentedColorIndex].name
        );
        const secondOptionIndex = RandomDraws.SingleFromRange(
          0,
          remainingColors.length - 1
        );
        selection_options_text.push(remainingColors[secondOptionIndex].name);
      } else {
        correctOptionIndex = 1;
        const remainingColors = stroopColors.filter(
          (c) => c.name !== stroopColors[presentedColorIndex].name
        );
        const secondOptionIndex = RandomDraws.SingleFromRange(
          0,
          remainingColors.length - 1
        );
        selection_options_text.push(remainingColors[secondOptionIndex].name);
        selection_options_text.push(stroopColors[presentedColorIndex].name);
      }

      trialConfigurations.push({
        presented_text: stroopColors[presentedTextIndex].name,
        presented_color: stroopColors[presentedColorIndex],
        selection_options_text: selection_options_text,
        correct_option_index: correctOptionIndex,
      });
    }

    // ==============================================================
    // SCENES: instructions
    const instructionsScenes = Instructions.Create({
      sceneNamePrefix: "instructions",
      instructionScenes: [
        {
          title: "cli starter assessment",
          text: `Select the color that matches the font color. This is commonly known as the Stroop task.`,
          textFontSize: 20,
          titleFontSize: 30,
        },
        {
          title: "cli starter assessment",
          text: `For example, the word Blue is colored Orange, so the correct response is Orange.`,
          textFontSize: 20,
          titleFontSize: 30,
          textVerticalBias: 0.15,
          image: "assessmentImage",
          imageAboveText: false,
          imageMarginTop: 20,
          /**
           * We override the next button's default text and color
           */
          nextButtonText: "START",
          nextButtonBackgroundColor: WebColors.Green,
        },
      ],
      postInstructionsScene: "preparationScene",
    });
    game.addScenes(instructionsScenes);

    // ==============================================================
    // SCENE: preparation. Show get ready message, then advance after
    // preparation_duration_ms milliseconds

    /**
     * For entities that are persistent across trials, such as the
     * scenes themsevles and labels that are always displayed, we create
     * them here.
     */
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

    /**
     * For entities that are displayed or actions that are run only when a
     * scene has been presented, we do them within the scene's onAppear()
     * or onSetup() callbacks. When a scene is presented, the order of
     * execution is:
     *   OnSetup() -> transitions -> OnAppear()
     * If there are no transitions, such as a scene sliding in, then
     * it makes no difference if you put code in OnSetup() or OnAppear().
     */
    preparationScene.onAppear(() => {
      preparationScene.run(
        Action.sequence([
          Action.wait({
            duration: game.getParameter("preparation_duration_ms"),
          }),
          // Custom actions are used execute code.
          Action.custom({
            callback: () => {
              game.presentScene(presentationScene);
            },
          }),
        ])
      );
    });

    // ==============================================================
    // SCENE: Present the word and get user selection
    const presentationScene = new Scene();
    game.addScene(presentationScene);

    /**
     * The "What colors is the font?" label will always be displayed in
     * the presentation scene, so we create it here and add it to the scene.
     */
    const whatColorIsFont = new Label({
      text: "What color is the font?",
      fontSize: 24,
      position: { x: 200, y: 100 },
    });
    presentationScene.addChild(whatColorIsFont);

    presentationScene.onAppear(() => {
      Timer.start("responseTime");
      const trialConfiguration = trialConfigurations[game.trialIndex];

      /**
       * The presented word will vary across trials. Thus, we create the
       * presented word label here within the scene's onAppear() callback.
       */
      const presentedWord = new Label({
        text: trialConfiguration.presented_text,
        position: { x: 200, y: 400 },
        fontSize: 48,
        fontColor: trialConfiguration.presented_color.rgba,
      });
      presentationScene.addChild(presentedWord);

      /**
       * Similarly, we create the buttons within the scene's onAppear()
       * callback because the buttons are different across trials.
       */
      const button0 = new Button({
        text: trialConfiguration.selection_options_text[0],
        size: { width: 150, height: 50 },
        position: { x: 100, y: 700 },
        isUserInteractionEnabled: true,
      });
      button0.onTapDown(() => {
        handleUserSelection(0);
      });
      presentationScene.addChild(button0);

      const button1 = new Button({
        text: trialConfiguration.selection_options_text[1],
        size: { width: 150, height: 50 },
        position: { x: 300, y: 700 },
        isUserInteractionEnabled: true,
      });
      button1.onTapDown(() => {
        handleUserSelection(1);
      });
      presentationScene.addChild(button1);

      function handleUserSelection(selectionIndex: number): void {
        /**
         * Set both buttons' isUserInteractionEnabled to false to prevent
         * double taps.
         */
        button0.isUserInteractionEnabled = false;
        button1.isUserInteractionEnabled = false;
        Timer.stop("responseTime");
        game.addTrialData("response_time_ms", Timer.elapsed("responseTime"));
        Timer.remove("responseTime");
        game.addTrialData(
          "presented_word_text",
          trialConfiguration.presented_text
        );
        game.addTrialData(
          "presented_word_color",
          trialConfiguration.presented_color.name
        );
        game.addTrialData(
          "selected_text",
          trialConfiguration.selection_options_text[selectionIndex]
        );
        const correct =
          trialConfiguration.correct_option_index === selectionIndex;
        game.addTrialData("selection_correct", correct);
        /**
         * When the trial has completed, you must call game.trialComplete() to
         * 1) Increase the game.trialIndex counter
         * 2) Trigger events that send the trial data to event subscribers
         */
        game.trialComplete();
        /**
         * When this trial is done, we must remove the presented word and the
         * buttons because they are not persistent across trials. We will
         * create new, different buttons and presented word labels in the next
         * trial.
         */
        presentationScene.removeChildren([presentedWord, button0, button1]);
        /**
         * Are we done all the trials, or should we do another trial
         * iteration?
         */
        if (game.trialIndex === game.getParameter<number>("number_of_trials")) {
          game.presentScene(doneScene);
        } else {
          game.presentScene(preparationScene);
        }
      }
    });

    // ==============================================================
    // SCENE: Done. Show done message, with a button to exit.
    const doneScene = new Scene();
    game.addScene(doneScene);

    const doneSceneText = new Label({
      text: "You have completed all the cli starter trials",
      position: { x: 200, y: 400 },
    });
    doneScene.addChild(doneSceneText);

    const okButton = new Button({
      text: "OK",
      position: { x: 200, y: 600 },
    });
    okButton.isUserInteractionEnabled = true;
    okButton.onTapDown(() => {
      // Don't allow repeat taps of ok button
      okButton.isUserInteractionEnabled = false;
      doneScene.removeAllChildren();
      /**
       * When the game is done, you must call game.end() to transfer control
       * back to the Session, which will then start the next activity or
       * send a session end event to the event subscribers.
       */
      game.end();
    });
    doneScene.addChild(okButton);
  }
}

const activity = new CliStarter();
const session = new Session({
  activities: [activity],
  sessionCallbacks: {
    /**
     * onSessionLifecycleChange() will be called on events such
     * as when the session initialization is complete or when the
     * session ends.
     *
     * Once initialized, the below code will start the session.
     */
    onSessionLifecycleChange: (ev: SessionLifecycleEvent) => {
      if (ev.initialized) {
        session.start();
      }
      if (ev.ended) {
        console.log("ended session");
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
