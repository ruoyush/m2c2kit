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
  RgbaColor,
  Constants,
} from "@m2c2kit/core";
import { Button, CountdownScene, Instructions } from "@m2c2kit/addons";

class CliStarter extends Game {
  constructor() {
    /**
     * These are configurable game parameters and their defaults.
     * Each game parameter should have a type, default (this is the default
     * value), and a description.
     */
    const defaultParameters: GameParameters = {
      countdown_duration_ms: {
        default: 3000,
        type: "number",
        description:
          "Duration of the countdown phase, milliseconds. Multiples of 1000 recommended.",
      },
      preparation_duration_ms: {
        type: "number",
        default: 500,
        description: "How long the 'get ready' message is shown, milliseconds.",
      },
      number_of_trials: {
        type: "integer",
        default: 5,
        description: "How many trials to run.",
      },
      show_fps: {
        type: "boolean",
        default: false,
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
    const cliStarterTrialSchema: TrialSchema = {
      trial_index: {
        type: ["integer", "null"],
        description: "Index of the trial within this assessment, 0-based.",
      },
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
      version: "__PACKAGE_JSON_VERSION__",
      moduleMetadata: Constants.MODULE_METADATA_PLACEHOLDER,
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
      showFps: defaultParameters.show_fps.default,
      /**
       * Actual pixel resolution will be scaled to fit the device, while
       * preserving the aspect ratio. It is important, however, to specify
       * a width and height to obtain the desired aspect ratio. In most
       * cases, you should not change this. 1:2 is a good aspect ratio
       * for modern phones.
       */
      width: 400,
      height: 800,
      trialSchema: cliStarterTrialSchema,
      parameters: defaultParameters,
      /**
       * The Roboto-Regular.ttf font is licensed under the Apache License,
       * and its LICENSE.TXT will be copied as part of the build.
       */
      fonts: [
        {
          fontName: "roboto",
          url: "fonts/roboto/Roboto-Regular.ttf",
        },
      ],
      images: [
        {
          imageName: "assessmentImage",
          /**
           * The image will be resized to the height and width specified.
           */
          height: 441,
          width: 255,
          /**
           * The image url must match the location of the image under the
           * src folder.
           */
          url: "images/assessmentExample.png",
        },
      ],
    };

    super(options);
  }

  override async initialize() {
    await super.initialize();
    /**
     * Just for convenience, alias the variable game to "this"
     * (even though eslint doesn't like it)
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    /**
     * ************************************************************************
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
        stroopColors.length - 1,
      );
      const presentedColorIndex = RandomDraws.SingleFromRange(
        0,
        stroopColors.length - 1,
      );

      const selection_options_text = new Array<string>();
      const firstIsCorrect = RandomDraws.SingleFromRange(0, 1);
      let correctOptionIndex;

      if (firstIsCorrect === 1) {
        correctOptionIndex = 0;
        selection_options_text.push(stroopColors[presentedColorIndex].name);
        const remainingColors = stroopColors.filter(
          (c) => c.name !== stroopColors[presentedColorIndex].name,
        );
        const secondOptionIndex = RandomDraws.SingleFromRange(
          0,
          remainingColors.length - 1,
        );
        selection_options_text.push(remainingColors[secondOptionIndex].name);
      } else {
        correctOptionIndex = 1;
        const remainingColors = stroopColors.filter(
          (c) => c.name !== stroopColors[presentedColorIndex].name,
        );
        const secondOptionIndex = RandomDraws.SingleFromRange(
          0,
          remainingColors.length - 1,
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

    /**
     * For nodes that are persistent across trials, such as the
     * scenes themselves and labels that are always displayed on the scenes,
     * create them here within the initialize() scope.
     */

    /**
     * ************************************************************************
     * Scenes: instructions.
     */
    const instructionsScenes = Instructions.create({
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
          imageName: "assessmentImage",
          imageAboveText: false,
          imageMarginTop: 20,
          /**
           * We override the next button's default text and color
           */
          nextButtonText: "START",
          nextButtonBackgroundColor: WebColors.Green,
        },
      ],
    });
    game.addScenes(instructionsScenes);

    /**
     * ************************************************************************
     * Scene: countdown. Show countdown for countdown_duration_ms milliseconds
     */
    const countdownScene = new CountdownScene({
      milliseconds: game.getParameter<number>("countdown_duration_ms"),
      // suppress the default countdown text
      text: "",
    });
    game.addScene(countdownScene);

    /**
     * ************************************************************************
     * Scene: preparation. Show get ready message, then advance after
     * preparation_duration_ms milliseconds
     */
    const preparationScene = new Scene();
    game.addScene(preparationScene);

    const getReadyMessage = new Label({
      text: "Get Ready",
      fontSize: 24,
      position: { x: 200, y: 400 },
    });
    preparationScene.addChild(getReadyMessage);

    /**
     * For nodes that are displayed or actions that are run only when a
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
        ]),
      );
    });

    /**
     * ************************************************************************
     * Scene: presentation. Present the word and get user selection
     */
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
          trialConfiguration.presented_text,
        );
        game.addTrialData(
          "presented_word_color",
          trialConfiguration.presented_color.name,
        );
        game.addTrialData(
          "selected_text",
          trialConfiguration.selection_options_text[selectionIndex],
        );
        const correct =
          trialConfiguration.correct_option_index === selectionIndex;
        game.addTrialData("selection_correct", correct);
        game.addTrialData("trial_index", game.trialIndex);
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

    /**
     * ************************************************************************
     * Scene: done. Show done message, with a button to exit.
     */
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

export { CliStarter };
