/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ActivityKeyValueData } from "@m2c2kit/core";
import * as SurveyReact from "survey-react";
import {
  CompletingOptions,
  CurrentPageChangingOptions,
  Survey,
  ValueChangedOptions,
} from "../../build-umd";

export interface surveyJsCallbacks {
  onCurrentPageChangingCallback: (
    sender: SurveyReact.Model,
    options: CurrentPageChangingOptions
  ) => void;
  onValueChangedCallback: (
    sender: SurveyReact.Model,
    options: ValueChangedOptions
  ) => void;
  onCompletingCallback: (
    sender: SurveyReact.Model,
    options: CompletingOptions
  ) => void;
}

export class TestHelpers {
  static cryptoGetRandomValuesPolyfill(): void {
    // @ts-ignore
    global.crypto = {
      // @ts-ignore
      getRandomValues: function (buffer: Array<T>) {
        const result = new Array<number>(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
          result.push(Math.floor(Math.random() * 256));
        }
        return result;
      },
    };
  }

  static setupDomAndGlobals(): void {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
          <div id="m2c2kit-survey-div"></div>      
          <canvas style="height: 100vh; width: 100vw"></canvas>
      </body>
    </html>`;
    document.documentElement.innerHTML = html;

    Object.defineProperty(window, "performance", {
      value: TestHelpers.performance,
    });
  }

  static perfCounter = 0;
  static requestedFrames = 0;
  static maxRequestedFrames = 0;

  static performance = {
    now: () => this.perfCounter,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createM2c2KitMock(): any {
    const skiaCanvas = {
      save: () => undefined,
      scale: () => undefined,
      drawRRect: () => undefined,
      restore: () => undefined,
      drawText: () => undefined,
    };

    const requestAnimationFrame = (callback: (canvas: object) => void) => {
      this.perfCounter = this.perfCounter + 16.66666666666667;
      if (TestHelpers.requestedFrames < TestHelpers.maxRequestedFrames) {
        TestHelpers.requestedFrames++;
        callback(skiaCanvas);
      }
      return undefined;
    };

    const m2c2kit = jest.requireActual("../../build-umd");

    m2c2kit.Session.prototype.loadCanvasKit = jest.fn().mockReturnValue(
      Promise.resolve({
        PaintStyle: {
          Fill: undefined,
        },
        MakeCanvasSurface: () => {
          return {
            reportBackendTypeIsGPU: () => true,
            getCanvas: () => {
              return skiaCanvas;
            },
            makeImageSnapshot: () => {
              return {
                delete: () => undefined,
              };
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
            width: () => {
              return NaN;
            },
            height: () => {
              return NaN;
            },
          };
        },
        MakeWebGLCanvasSurface: () => {
          return {
            reportBackendTypeIsGPU: () => true,
            getCanvas: () => {
              return skiaCanvas;
            },
            makeImageSnapshot: () => {
              return {
                delete: () => undefined,
              };
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
            width: () => {
              return NaN;
            },
            height: () => {
              return NaN;
            },
          };
        },
        Font: function () {
          return {
            delete: () => undefined,
            isDeleted: () => undefined,
          };
        },
        Paint: function () {
          return {
            setColor: () => undefined,
            setAntiAlias: () => undefined,
            setStyle: () => undefined,
            delete: () => undefined,
            isDeleted: () => undefined,
          };
        },
        Color: function () {
          return {};
        },
        LTRBRect: function () {
          return {};
        },
        RRectXY: function () {
          return {};
        },
      })
    );
    return m2c2kit;
  }

  static callOnActivityResultsCallbackSpy?: jest.SpyInstance;

  static spyOnSurveyReactModel(
    surveyModel: SurveyReact.Model,
    onActivityResultsCallback: (
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) => void
  ): void {
    this.callOnActivityResultsCallbackSpy = jest.spyOn(
      Survey.prototype,
      "callOnActivityResultsCallback"
    );
    this.callOnActivityResultsCallbackSpy.mockImplementation(
      (newData: ActivityKeyValueData, data: ActivityKeyValueData) => {
        onActivityResultsCallback(newData, data);
      }
    );

    jest
      // @ts-ignore
      .spyOn(Survey.prototype, "createSurveyReactModel")
      // @ts-ignore
      .mockImplementation(() => {
        return surveyModel;
      });
  }
}