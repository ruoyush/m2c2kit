import {
  Session,
  SessionLifecycleEvent,
  ActivityDataEvent,
  ActivityLifecycleEvent,
} from "@m2c2kit/core";

import { ColorDots } from "@m2c2kit/assessment-color-dots";
import { GridMemory } from "@m2c2kit/assessment-grid-memory";
import { SymbolSearch } from "@m2c2kit/assessment-symbol-search";
import { CliStarter } from "@m2c2kit/assessment-cli-starter";

const a1 = new ColorDots();
const a2 = new GridMemory();
const a3 = new SymbolSearch();
const a4 = new CliStarter();

const session = new Session({
  activities: [a1, a2, a3, a4],
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
