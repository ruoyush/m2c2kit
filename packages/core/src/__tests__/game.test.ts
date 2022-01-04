/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Activity,
  ActivityOptions,
  Game,
  GameOptions,
  Action,
  Scene,
  Shape,
  Size,
  Point,
} from "../../build-umd";
import { JSDOM } from "jsdom";

// jest.mock("../../dist/umd/m2c2kit", () => {
//   const m2c2kit = jest.requireActual("../../dist/umd/m2c2kit");
//   // original.Game.prototype.init = (options: GameInitOptions): Promise<void> => {
//   //   throw new Error("err!");
//   // }

//   m2c2kit.Game.prototype.init = jest.fn().mockReturnValue(Promise.resolve());
//   return m2c2kit;
// });

// for how to mock part of a module using jest,
// see https://www.chakshunyu.com/blog/how-to-mock-only-one-function-from-a-module-in-jest/

let maxRequestedFrames = 180;
let requestedFrames = 0;

const skiaCanvas = {
  save: () => undefined,
  scale: () => undefined,
  drawRRect: () => undefined,
  restore: () => undefined,
  drawText: () => undefined,
};

const requestAnimationFrame = (callback: (canvas: object) => void) => {
  perfCounter = perfCounter + 16.66666666666667;
  if (requestedFrames < maxRequestedFrames) {
    requestedFrames++;
    callback(skiaCanvas);
  }
  return undefined;
};

jest.mock("../../build-umd", () => {
  const m2c2kit = jest.requireActual("../../build-umd");

  m2c2kit.Activity.prototype.loadCanvasKit = jest.fn().mockReturnValue(
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
            return {};
          },
          requestAnimationFrame: (callback: (canvas: object) => void) => {
            return requestAnimationFrame(callback);
          },
        };
      },
      Font: function () {
        return {};
      },
      Paint: function () {
        return {
          setColor: () => undefined,
          setAntiAlias: () => undefined,
          setStyle: () => undefined,
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
});

class Game1 extends Game {
  constructor(specifiedParameters?: any) {
    const gameOptions: GameOptions = {
      name: "game1",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions, specifiedParameters);
    const game = this;
    const s = new Scene({
      name: "game1FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;

    const rect1 = new Shape({
      rect: { size: new Size(100, 100) },
      name: "myRect1",
      position: new Point(200, 200),
    });
    s.addChild(rect1);
  }
}

class Game2 extends Game {
  constructor(specifiedParameters?: any) {
    const gameOptions: GameOptions = {
      name: "game2",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
      stretch: true,
    };

    super(gameOptions, specifiedParameters);
    const game = this;
    const s = new Scene({
      name: "game2FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

let activity: Activity;
let g1: Game1;
let g2: Game2;
let perfCounter: number;

beforeEach(() => {
  g1 = new Game1();
  g2 = new Game2();

  const options: ActivityOptions = { games: [g1, g2] };
  activity = new Activity(options);

  const dom = new JSDOM(`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
        <canvas style="height: 100vh; width: 100vw"></canvas>
      </div>
    </body>
  </html>`);

  // for how to mock globals,
  // see https://www.grzegorowski.com/how-to-mock-global-window-with-jest

  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;

  perfCounter = 0;
  global.window.performance.now = () => {
    return perfCounter;
  };

  requestedFrames = 0;
});

describe("actions", () => {
  it("shape completes move from 200, 200 to 50, 50", () => {
    maxRequestedFrames = 63;

    return activity.init().then(() => {
      const rect1 = g1.entities
        .filter((e) => e.name === "myRect1")
        .find(Boolean)!;
      rect1.run(Action.Move({ point: new Point(50, 50), duration: 1000 }));
      activity.start();
      console.debug(
        `frames requested: ${requestedFrames}, ellapsed virtual milliseconds: ${perfCounter}`
      );
      expect(rect1.position).toEqual(new Point(50, 50));
    });
  });

  it("shape is exactly midway halfway through move from 200, 200 to 50, 50", () => {
    maxRequestedFrames = 31;

    return activity.init().then(() => {
      const rect1 = g1.entities
        .filter((e) => e.name === "myRect1")
        .find(Boolean)!;
      rect1.run(Action.Move({ point: new Point(50, 50), duration: 1000 }));
      activity.start();
      console.debug(
        `frames requested: ${requestedFrames}, ellapsed virtual milliseconds: ${perfCounter}`
      );
      expect(rect1.position).toEqual(new Point(125, 125));
    });
  });
});

describe("Game start", () => {
  it("scales down on smaller screen that is half the size", () => {
    global.window.innerWidth = 200;
    global.window.innerHeight = 400;
    return activity.init().then(() => {
      activity.start();
      expect(Globals.rootScale).toBe(0.5);
    });
  });

  it("scales down on smaller screen with different aspect ratio", () => {
    global.window.innerWidth = 400;
    global.window.innerHeight = 200;
    return activity.init().then(() => {
      activity.start();
      expect(Globals.rootScale).toBe(0.25);
    });
  });

  it("scales up on larger screen that is double the size when stretch is true", () => {
    global.window.innerWidth = 800;
    global.window.innerHeight = 1600;
    return activity.init().then(() => {
      activity.start();
      activity.nextGame();
      expect(Globals.rootScale).toBe(2);
    });
  });

  it("scales up on larger screen with different aspect ratio when stretch is true", () => {
    global.window.innerWidth = 1200;
    global.window.innerHeight = 1200;
    return activity.init().then(() => {
      activity.start();
      activity.nextGame();
      expect(Globals.rootScale).toBe(1.5);
    });
  });
});