/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TestHelpers } from "./TestHelpers";
import {
  Session,
  SessionOptions,
  Game,
  GameOptions,
  Action,
  Scene,
  Shape,
  TrialSchema,
  Label,
} from "../../build-umd";
import { JSDOM } from "jsdom";

TestHelpers.cryptoGetRandomValuesPolyfill();
jest.mock("../../build-umd", () => {
  return TestHelpers.createM2c2KitMock();
});

class Game1 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game1",
      id: "game1",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const s = new Scene({
      name: "game1FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;

    const rect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "myRect1",
      position: { x: 200, y: 200 },
    });
    s.addChild(rect1);
  }
}

class Game2 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game2",
      id: "game2",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
      stretch: true,
    };

    super(gameOptions);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const s = new Scene({
      name: "game2FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

let session: Session;
let g1: Game1;
let g2: Game2;

function setupDomAndGlobals(): void {
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
  // @ts-ignore
  global.performance = TestHelpers.performance;
}

describe("actions", () => {
  beforeEach(() => {
    g1 = new Game1();
    g2 = new Game2();

    const options: SessionOptions = { activities: [g1, g2] };
    session = new Session(options);
    setupDomAndGlobals();
  });

  it("shape completes move from 200, 200 to 50, 50", () => {
    return session.init().then(() => {
      TestHelpers.perfCounter = 0;
      TestHelpers.requestedFrames = 0;
      TestHelpers.maxRequestedFrames = 63;
      const rect1 = g1.entities
        .filter((e) => e.name === "myRect1")
        .find(Boolean);
      if (!rect1) {
        throw new Error("rect1 undefined");
      }
      rect1.run(Action.move({ point: { x: 50, y: 50 }, duration: 1000 }));
      session.start();
      console.debug(
        `frames requested: ${TestHelpers.requestedFrames}, ellapsed virtual milliseconds: ${TestHelpers.perfCounter}`
      );
      expect(rect1.position).toEqual({ x: 50, y: 50 });
    });
  });

  it("shape is exactly midway halfway through move from 200, 200 to 50, 50", () => {
    return session.init().then(() => {
      TestHelpers.perfCounter = 0;
      TestHelpers.requestedFrames = 0;
      TestHelpers.maxRequestedFrames = 32;
      const rect1 = g1.entities
        .filter((e) => e.name === "myRect1")
        .find(Boolean);
      if (!rect1) {
        throw new Error("rect1 undefined");
      }

      rect1.run(Action.move({ point: { x: 50, y: 50 }, duration: 1000 }));
      session.start();
      console.debug(
        `frames requested: ${TestHelpers.requestedFrames}, ellapsed virtual milliseconds: ${TestHelpers.perfCounter}`
      );
      expect(Math.round(rect1.position.x)).toEqual(125);
      expect(Math.round(rect1.position.y)).toEqual(125);
    });
  });
});

describe("Game start", () => {
  beforeEach(() => {
    g1 = new Game1();
    g2 = new Game2();

    const options: SessionOptions = { activities: [g1, g2] };
    session = new Session(options);
    setupDomAndGlobals();
  });

  it("scales down on smaller screen that is half the size", () => {
    global.window.innerWidth = 200;
    global.window.innerHeight = 400;
    return session.init().then(() => {
      session.start();
      expect(Globals.rootScale).toBe(0.5);
    });
  });

  it("scales down on smaller screen with different aspect ratio", () => {
    global.window.innerWidth = 400;
    global.window.innerHeight = 200;
    return session.init().then(() => {
      session.start();
      expect(Globals.rootScale).toBe(0.25);
    });
  });

  it("scales up on larger screen that is double the size when stretch is true", () => {
    global.window.innerWidth = 800;
    global.window.innerHeight = 1600;
    return session.init().then(() => {
      session.start();
      session.advanceToNextActivity();
      expect(Globals.rootScale).toBe(2);
    });
  });

  it("scales up on larger screen with different aspect ratio when stretch is true", () => {
    global.window.innerWidth = 1200;
    global.window.innerHeight = 1200;
    return session.init().then(() => {
      session.start();
      session.advanceToNextActivity();
      expect(Globals.rootScale).toBe(1.5);
    });
  });
});

describe("free entities", () => {
  beforeEach(() => {
    g1 = new Game1();
    g2 = new Game2();

    g1.addFreeEntity(new Shape({ circleOfRadius: 10, name: "the-circle" }));
    const options: SessionOptions = { activities: [g1, g2] };
    session = new Session(options);
    setupDomAndGlobals();
  });

  it("removes all free entities", () => {
    return session.init().then(() => {
      const game = g1;
      const label = new Label({ text: "label text" });
      game.addFreeEntity(label);
      game.removeAllFreeEntities();
      expect(game.freeEntities.length).toBe(0);
    });
  });

  it("adds a free entity", () => {
    return session.init().then(() => {
      const game = g1;
      const label = new Label({ text: "label text" });
      game.addFreeEntity(label);
      expect(game.freeEntities.length).toBe(2);
    });
  });

  it("adds a free entity and removes free entity by object", () => {
    return session.init().then(() => {
      const game = g1;
      const label = new Label({ text: "label text" });
      game.addFreeEntity(label);
      game.removeFreeEntity(label);
      expect(game.freeEntities.length).toBe(1);
    });
  });

  it("adds a free entity and removes free entity by name", () => {
    return session.init().then(() => {
      const game = g1;
      const label = new Label({ text: "label text", name: "the-label" });
      game.addFreeEntity(label);
      game.removeFreeEntity("the-label");
      expect(game.freeEntities.length).toBe(1);
    });
  });

  it("throws error when attempting to remove entity object that has not been added as a free entity", () => {
    return session.init().then(() => {
      const game = g1;
      const label = new Label({ text: "label text", name: "the-label" });
      const t = () => game.removeFreeEntity(label);
      expect(t).toThrowError();
    });
  });

  it("throws error when attempting to remove entity name that has not been added as a free entity", () => {
    return session.init().then(() => {
      const game = g1;
      const t = () => game.removeFreeEntity("some-entity");
      expect(t).toThrowError();
    });
  });
});

class Game3 extends Game {
  constructor() {
    const trialSchema: TrialSchema = {
      boolean_data: {
        type: "boolean",
      },
      string_data: {
        type: "string",
      },
      integer_data: {
        type: "integer",
      },
      number_data: {
        type: "number",
      },
      object_data: {
        type: "object",
      },
      array_data: {
        type: "array",
      },
      null_data: {
        type: "null",
      },
      string_or_null_data: {
        type: ["string", "null"],
      },
    };

    const gameOptions: GameOptions = {
      name: "game3",
      id: "game3",
      version: "0.1",
      width: 400,
      height: 800,
      trialSchema: trialSchema,
    };

    super(gameOptions);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const s = new Scene({
      name: "game1FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

let g3: Game3;

describe("addTrialData", () => {
  beforeEach(() => {
    g3 = new Game3();
    const options: SessionOptions = { activities: [g3] };
    session = new Session(options);
    setupDomAndGlobals();
  });

  it("adds boolean data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("boolean_data", true);
    });
  });

  it("adds string data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("string_data", "hello");
    });
  });

  it("adds integer data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("integer_data", 10);
    });
  });

  it("adds number data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("number_data", 5.5);
    });
  });

  it("adds object data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("object_data", { a: 1, b: 2 });
    });
  });

  it("adds array data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("array_data", [1, 2, 3]);
    });
  });

  it("adds null data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("null_data", null);
    });
  });

  it("adds undefined data", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("null_data", undefined);
    });
  });

  it("adds string data to string | null schema", () => {
    return session.init().then(() => {
      session.start();
      g3.addTrialData("string_or_null_data", "hello");
    });
  });

  it("throws error when adding string data to boolean schema", () => {
    return session.init().then(() => {
      session.start();
      const t = () => g3.addTrialData("boolean_data", "hello");
      expect(t).toThrow(Error);
    });
  });

  it("throws error when adding null data to boolean schema", () => {
    return session.init().then(() => {
      session.start();
      const t = () => g3.addTrialData("boolean_data", null);
      expect(t).toThrowError();
    });
  });

  it("throws error when adding non-integer number to integer schema", () => {
    return session.init().then(() => {
      session.start();
      const t = () => g3.addTrialData("integer_data", 5.5);
      expect(t).toThrowError();
    });
  });
});
