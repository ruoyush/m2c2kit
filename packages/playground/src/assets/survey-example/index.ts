import {
    Session,
    SessionLifecycleEvent,
    ActivityResultsEvent,
    ActivityLifecycleEvent,
    ActivityType,
    EventType
  } from "@m2c2kit/core";
  import { Survey } from "@m2c2kit/survey";
   
  const surveyJson = {
    title: "m2c2kit demo survey",
    /**
     * Specify a name for the survey so m2c2kit can assign an identifier for
     * this activity. Within a study, use different survey names.
     */
    name: "demo-survey",
    pages: [
      {
        name: "page1",
        elements: [
          {
            type: "expression",
            /**
             * Preface the name with double underscore if you don't want to
             * generate data from the element.
             */
            name: "__welcome",
            title: "This is an example welcome screen.",
          },
        ],
      },
      {
        name: "page2",
        elements: [
          {
            type: "radiogroup",
            name: "where_now",
            title: "Where are you?",
            choices: [
              {
                value: 1,
                text: "Your home",
              },
              {
                value: 2,
                text: "Other person's home",
              },
              {
                value: 3,
                text: "Office or other work place",
              },
              {
                value: 5,
                text: "Other",
              },
            ],
          },
        ],
        description: "RIGHT NOW...",
      },
      {
        name: "page3",
        elements: [
          {
            type: "checkbox",
            name: "who_now",
            title: "Who is around you? (Please select all that apply.)",
            choices: [
              {
                value: 1,
                text: "Spouse/Partner",
              },
              {
                value: 2,
                text: "Your child(ren) or grandchild(ren)",
              },
              {
                value: 3,
                text: "Other family member(s)",
              },
              {
                value: 4,
                text: "Other people",
              },
            ],
            hasNone: true,
            noneText: "Nobody",
          },
        ],
        description: "RIGHT NOW...",
      },
      {
        name: "page4",
        elements: [
          {
            type: "nouislider",
            name: "mood_valence",
            title: "How is your overall MOOD?",
            rangeMin: 0,
            rangeMax: 100,
            pipsDensity: -1,
            showOnlyPipsWithPipsText: true,
            pipsText: [
              {
                value: 0,
                text: "Very Bad",
              },
              {
                value: 100,
                text: "Very Good",
              },
            ],
          },
        ],
        description: "example of a custom SurveyJS widget.",
      },
      {
        name: "page5",
        elements: [
          {
            name: "date",
            type: "bootstrapdatepicker",
            inputType: "date",
            title: "What is your favorite date?",
            dateFormat: "mm/dd/yy",
          },
        ],
        description: "example of a custom SurveyJS widget.",
      },
      {
        name: "page6",
        elements: [
          {
            name: "countries",
            type: "tagbox",
            title:
              "Please select all countries you have been for the last 3 years.",
            choices: [
              {
                value: 1,
                text: "USA",
              },
              {
                value: 2,
                text: "Mexico",
              },
              {
                value: 3,
                text: "Canada",
              },
              {
                value: 999,
                text: "None",
              },
            ],
          },
        ],
        description: "example of a custom SurveyJS widget.",
      },
      {
        name: "page7",
        elements: [
          {
            name: "bootstrapslider-widget",
            type: "bootstrapslider",
            title: "This is a different style of slider.",
            step: 50,
            rangeMin: 100,
            rangeMax: 1000,
          },
        ],
        description: "example of a custom SurveyJS widget.",
      },
    ],
    /**
     * Uncomment to supress questions numbers
     */
    // showQuestionNumbers: "off",
  
    /**
     * On the last question, the advance button will say "Complete". You can
     * specify a different text.
     */
    // completeText: "Finish"
  };
   
  const survey = new Survey(surveyJson);  

  const session = new Session({
    activities: [survey],
    canvasKitWasmUrl: "assets/canvaskit.wasm",
    sessionCallbacks: {
      /**
       * onSessionLifecycle() will be called on events such
       * as when the session initialization is complete or when the
       * session ends.
       *
       * Once initialized, the below code will start the session.
       */
      onSessionLifecycle: (ev: SessionLifecycleEvent) => {
        if (ev.type === EventType.SessionInitialize) {
          session.start();
        }
        if (ev.type === EventType.SessionEnd) {
          console.log("🔴 ended session");
        }
      },
    },
    activityCallbacks: {
      /**
       * onActivityResults() callback is where you insert code to post data
       * to an API or interop with a native function in the host app,
       * if applicable.
       *
       * newData is the data that was just generated by the completed trial or
       * survey question.
       * data is all the data, cumulative of all trials or questions in the
       * activity, that have been generated.
       *
       * We separate out newData from data in case you want to alter the execution
       * based on the most recent trial, e.g., maybe you want to stop after
       * a certain user behavior or performance threshold in the just completed
       * trial.
       *
       * activityConfiguration is the game parameters that were used.
       *
       * The schema for all of the above are in JSON Schema format.
       * Currently, only games generate schema.
       */
      onActivityResults: (ev: ActivityResultsEvent) => {
        if (ev.target.type === ActivityType.Game) {
          console.log(`✅ trial complete:`);
        } else if (ev.target.type === ActivityType.Survey) {
          console.log(`✅ survey response:`);
        }
        console.log("  newData: " + JSON.stringify(ev.newData));
        console.log("  newData schema: " + JSON.stringify(ev.newDataSchema));
        console.log("  data: " + JSON.stringify(ev.data));
        console.log("  data schema: " + JSON.stringify(ev.dataSchema));
        console.log(
          "  activity parameters: " + JSON.stringify(ev.activityConfiguration)
        );
        console.log(
          "  activity parameters schema: " +
            JSON.stringify(ev.activityConfigurationSchema)
        );
        console.log("  activity metrics: " + JSON.stringify(ev.activityMetrics));
      },
      /**
       * onActivityLifecycle() notifies us when an activity, such
       * as a game (assessment) or a survey, has ended or canceled.
       * Usually, however, we want to know when all the activities are done,
       * so we'll look for the session ending via onSessionLifecycleChange
       */
      onActivityLifecycle: (ev: ActivityLifecycleEvent) => {
        const activityType =
          ev.target.type === ActivityType.Game ? "game" : "survey";
        if (ev.type === EventType.ActivityEnd || ev.type === EventType.ActivityCancel) {
          const status = ev.type === EventType.ActivityEnd? "🔴 ended" : "🚫 canceled";
          console.log(`${status} activity (${activityType}) ${ev.target.name}`);
          if (session.nextActivity) {
            session.advanceToNextActivity();
          } else {
            session.end();
          }
        }
        if (ev.type === EventType.ActivityStart) {
          console.log(`🟢 started activity (${activityType}) ${ev.target.name}`);
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
  