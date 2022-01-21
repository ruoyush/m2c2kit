import { Session, Uuid, Activity, EventType } from "@m2c2kit/core";
import $ from "jquery";
import * as SurveyKO from "survey-knockout";
import widgets from "surveyjs-widgets";
import select2 from "select2";
import "bootstrap-datepicker";
import "sortablejs";

export class Survey implements Activity {
  _session?: Session;
  name: string;
  uuid = Uuid.generate();
  surveyJson: unknown;

  constructor(surveyJson: unknown) {
    this.surveyJson = surveyJson;
    this.name = (surveyJson as any)?.name ?? "unnamed survey";
  }

  start(): void {
    // This modern theme doesn't seem as polished as
    // survey theme. It has some minor issues with margins and
    // the bootstrap-datepicker
    // SurveyKO.StylesManager.applyTheme("modern");
    SurveyKO.StylesManager.applyTheme("survey");

    // custom widgets need to be separately initialized by widget
    widgets.nouislider(SurveyKO);
    select2($);
    widgets.select2tagbox(SurveyKO, $);
    widgets.sortablejs(SurveyKO);
    widgets.bootstrapdatepicker(SurveyKO, $);

    const survey = new SurveyKO.Survey(this.surveyJson);
    survey.focusFirstQuestionAutomatic = false;
    survey.completeText = "Next";
    // this hides the default surveyjs default complation html
    survey.completedHtml = `<html></html>`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    survey.onComplete.add((sender: any) => {
      console.log(`Finished survey. Data: ${JSON.stringify(sender.data)} `);
      const surveyDiv = document.getElementById("surveyContainer");
      if (surveyDiv) {
        surveyDiv.hidden = true;
      }
      if (this.session.options.activityCallbacks?.onActivityLifecycleChange) {
        this.session.options.activityCallbacks.onActivityLifecycleChange({
          eventType: EventType.activityLifecycle,
          ended: true,
          uuid: this.uuid,
          name: this.name,
        });
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    survey.onValueChanged.add((sender: any, options: any) => {
      console.log(`variable ${options.name} set: ${options.value}`);
    });
    survey.render("surveyContainer");
  }

  stop(): void {
    console.log("stop");
  }

  get session(): Session {
    if (!this._session) {
      throw new Error("session is undefined");
    }
    return this._session;
  }

  set session(session: Session) {
    this._session = session;
  }
}
