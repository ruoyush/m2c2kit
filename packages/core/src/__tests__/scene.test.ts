import { TestHelpers } from "./TestHelpers";
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Session,
  SessionOptions,
  Game,
  GameOptions,
  Scene,
  Label,
  Shape,
  WebColors,
} from "../../build-umd";
import { JSDOM } from "jsdom";

/** Because jest.mock() is hoisted, any other variables provided to it must be
 * hoisted as well. We do that by using var on these variables.
 * see https://stackoverflow.com/a/68073694
 */
// eslint-disable-next-line no-var
var maxRequestedFrames = 180;
// eslint-disable-next-line no-var
var requestedFrames = 0;
// eslint-disable-next-line no-var
var perfCounter = 0;

jest.mock("../../build-umd", () =>
  TestHelpers.createM2c2KitMock(
    perfCounter,
    requestedFrames,
    maxRequestedFrames
  )
);

let session: Session;
let g1: Game1;
let scene1: Scene;
let label1: Label;
let rect1: Shape;

class Game1 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game1",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    game.init();

    const scene1 = new Scene({
      name: "myScene1",
      backgroundColor: WebColors.Purple,
    });
    game.addScene(scene1);
    const label1 = new Label({ text: "Hello", name: "myLabel1" });
    scene1.addChild(label1);
    const rect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "myRect1",
    });
    label1.addChild(rect1);

    game.addScene(scene1);
    game.entryScene = scene1;
  }
}

beforeEach(() => {
  g1 = new Game1();
  rect1 = g1.entities
    .filter((e) => e.name === "myRect1")
    .find(Boolean) as Shape;
  if (!rect1) {
    throw new Error("myRect1 undefined");
  }

  scene1 = g1.entities
    .filter((e) => e.name === "myScene1")
    .find(Boolean) as Scene;
  if (!scene1) {
    throw new Error("myScene1 undefined");
  }

  label1 = g1.entities
    .filter((e) => e.name === "myLabel1")
    .find(Boolean) as Label;
  if (!label1) {
    throw new Error("myLabel1 undefined");
  }

  const options: SessionOptions = { activities: [g1] };
  session = new Session(options);

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

describe("test duplicate method", () => {
  it("scene2 is a scene", () => {
    return session.init().then(() => {
      const scene2 = scene1.duplicate();
      expect(scene2).toBeInstanceOf(Scene);
    });
  });

  it("scene2's game is scene1's game", () => {
    return session.init().then(() => {
      const scene2 = scene1.duplicate();
      expect(scene2.game).toEqual(scene1.game);
    });
  });

  it("scene2's backgroundcolor to equal scene1's background", () => {
    return session.init().then(() => {
      const scene2 = scene1.duplicate();
      expect(scene2.backgroundColor).toEqual(scene1.backgroundColor);
    });
  });

  it("scene2's name is not equal to scene1's name when no new name is given", () => {
    return session.init().then(() => {
      const scene2 = scene1.duplicate();
      expect(scene2.name).not.toEqual(scene1.name);
    });
  });

  it("scene2's name is equal to the new name provided", () => {
    return session.init().then(() => {
      const scene2 = scene1.duplicate("my new scene2");
      expect(scene2.name).toEqual("my new scene2");
    });
  });

  it("scene2's children is duplicated deep copy of scene1's children", () => {
    return session.init().then(() => {
      const scene2 = scene1.duplicate();
      expect(scene2.children[0]).toBeInstanceOf(Label);
      expect(scene2.children[0]).not.toEqual(label1);
      expect(scene2.children[0].children[0]).toBeInstanceOf(Shape);
      expect(scene2.children[0].children[0]).not.toEqual(rect1);
    });
  });
});