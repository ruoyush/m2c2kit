import {
  Session,
  SessionLifecycleEvent,
  ActivityResultsEvent,
  ActivityLifecycleEvent,
  ActivityType,
  EventType,
} from "@m2c2kit/core";
import { Embedding } from "@m2c2kit/embedding";

import { ColorDots } from "@m2c2kit/assessment-color-dots";
import { ColorShapes } from "@m2c2kit/assessment-color-shapes";
import { GridMemory } from "@m2c2kit/assessment-grid-memory";
import { SymbolSearch } from "@m2c2kit/assessment-symbol-search";
import { CliStarter } from "@m2c2kit/assessment-cli-starter";

const a1 = new ColorShapes();
const a2 = new ColorDots();
const a3 = new GridMemory();
const a4 = new SymbolSearch();
const a5 = new CliStarter();

const session = new Session({
  activities: [a1, a2, a3, a4, a5],
  canvasKitWasmUrl: "assets/canvaskit.wasm",
  sessionCallbacks: {
    /**
     * onSessionLifecycle() will be called on events such
     * as when the session initialization is complete or when the
     * session ends.
     *
     * Once initialized, the below code will start the session.
     */
    onSessionLifecycle: async function (ev: SessionLifecycleEvent) {
      //#region to support m2c2kit in WebView
      if (Embedding.contextIsWebView()) {
        Embedding.sendEventToWebView(ev);
      }
      //#endregion

      if (ev.type === EventType.SessionInitialize) {
        //#region to support m2c2kit in WebView
        if (Embedding.contextIsWebView() && Embedding.sessionManualStart()) {
          // don't automatically start! Let the native code
          // set game parameters and start the game when desired.
          return;
        }
        //#endregion
        await session.start();
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
    onActivityResults: function (ev: ActivityResultsEvent) {
      //#region to support m2c2kit in WebView
      if (Embedding.contextIsWebView()) {
        Embedding.sendEventToWebView(ev);
      }
      //#endregion

      if (ev.target.type === ActivityType.Game) {
        console.log(`✅ trial complete:`);
      } else if (ev.target.type === ActivityType.Survey) {
        console.log(`✅ question answered:`);
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
    onActivityLifecycle: async function (ev: ActivityLifecycleEvent) {
      //#region to support m2c2kit in WebView
      if (Embedding.contextIsWebView()) {
        Embedding.sendEventToWebView(ev);
      }
      //#endregion

      const activityType =
        ev.target.type === ActivityType.Game ? "game" : "survey";
      if (
        ev.type === EventType.ActivityEnd ||
        ev.type === EventType.ActivityCancel
      ) {
        const status =
          ev.type === EventType.ActivityEnd ? "🔴 ended" : "🚫 canceled";
        console.log(`${status} activity (${activityType}) ${ev.target.name}`);
        if (session.nextActivity) {
          await session.goToNextActivity();
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
 * Needed to support loading wasm from file in iOS WKWebView
 */
Embedding.ConfigureWasmFetchInterceptor();
/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or a mobile WebView's invocation of session.start().
 * */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init();
