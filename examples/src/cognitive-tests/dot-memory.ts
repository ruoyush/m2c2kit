import { WebColors } from "../../../lib/src";
import { Game } from "../../../lib/src/Game";
import { Transition, TransitionDirection } from "../../../lib/src/Transition";
import { RandomDraws } from "../../../lib/src/RandomDraws";
import { Scene } from "../../../lib/src/Scene";
import { Action } from "../../../lib/src/Action";
import { Rect } from "../../../lib/src/Rect";
import { Shape } from "../../../lib/src/Shape";
import { Label } from "../../../lib/src/Label";
import { LabelHorizontalAlignmentMode } from "../../../lib/src/LabelHorizontalAlignmentMode";
import { Size } from "../../../lib/src/Size";
import { Point } from "../../../lib/src/Point";
import { Button, Grid } from "../../../lib/src/addons/composites";
import { Instructions } from "../../../lib/src/addons/stories";

const game = new Game();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).game = game;

// game parameter defaults to be used if values are not provided
// default parameters are not part of the m2c2kit engine, because parameters
// are different for each game that might be written. Thus, define them here
const defaults = {
  ReadyTime: 1000,
  InterferenceTime: 8000,
  DotPresentTime: 3000,
  TrialNum: 2,
};

// These are the data we will output at the end of each schema
const gridMemoryTrialSchema = {
  responseTime: "number",
  correct: "boolean",
  jsondata: "object",
};

game
  .init({
    showFps: true,
    width: 400,
    height: 800,
    trialSchema: gridMemoryTrialSchema,
    defaultParameters: defaults,
    bodyBackgroundColor: WebColors.Wheat,
    fontUrls: [
      "https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf",
    ],
  })
  .then(() => {
    // SCENES: instructions
    const instructionsScenes = Instructions.Create({
      sceneNamePrefix: "instructions",
      backgroundColor: WebColors.White,
      instructionScenes: [
        {
          title: "Grid Memory",
          text: "This is the Grid Memory test. We should have some more instructions with pictures.",
        },
        {
          title: "Grid Memory",
          text: "Press START to begin!",
          textFontSize: 24,
          textAlignmentMode: LabelHorizontalAlignmentMode.center,
          nextButtonText: "START",
        },
      ],
      postInstructionsScene: "getReadyScene",
    });
    game.addScenes(instructionsScenes);

    const nextScreenTransition = Transition.push(TransitionDirection.left, 500);
    const previousScreenTransition = Transition.push(
      TransitionDirection.right,
      500
    );

    // SCENE: show get ready message, then advance after XXXX
    // milliseconds (as defined in ReadyTime parameter)
    game.trialNumber = 0;
    const gridMemoryPage0 = new Scene({
      name: "getReadyScene",
      backgroundColor: WebColors.White,
    });
    game.addScene(gridMemoryPage0);

    const getReadyMessage = new Label({
      text: "Get Ready",
      position: new Point(200, 400),
    });
    gridMemoryPage0.addChild(getReadyMessage);

    gridMemoryPage0.setup(() => {
      gridMemoryPage0.run(
        Action.Sequence([
          Action.Wait({ duration: game.getParameter("ReadyTime") }),
          Action.Custom({
            callback: () => {
              game.presentScene(gridMemoryPage1);
            },
          }),
        ])
      );
    });

    // SCENE: show the dot placement
    const gridMemoryPage1 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage1);

    const page1Message = new Label({
      text: "Remember the dot locations!",
      fontSize: 24,
      position: new Point(200, 150),
    });
    gridMemoryPage1.addChild(page1Message);

    const grid1 = new Grid({
      size: new Size(300, 300),
      position: new Point(200, 400),
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    gridMemoryPage1.addChild(grid1);

    gridMemoryPage1.setup(() => {
      grid1.removeAllChildren();

      // randomly choose 3 cells that will have the red dots
      // on a grid of size 5 rows, 5 columns
      const randomCells = RandomDraws.FromGridWithoutReplacement(3, 5, 5);
      for (let i = 0; i < 3; i++) {
        const circle = new Shape({
          circleOfRadius: 20,
          fillColor: WebColors.Red,
          strokeColor: WebColors.Black,
          lineWidth: 2,
        });
        grid1.addAtCell(circle, randomCells[i].row, randomCells[i].column);
      }

      gridMemoryPage1.run(
        Action.Sequence([
          Action.Wait({ duration: game.getParameter("DotPresentTime") }),
          Action.Custom({
            callback: () => {
              game.presentScene(gridMemoryPage2, nextScreenTransition);
            },
          }),
        ])
      );
    });

    // SCENE: ask participant to the touch the Fs
    const gridMemoryPage2 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage2);

    const touchTheFs = new Label({
      text: "Touch the F's!",
      position: new Point(200, 100),
    });
    gridMemoryPage2.addChild(touchTheFs);

    const grid = new Grid({
      size: new Size(300, 480),
      position: new Point(200, 400),
      rows: 8,
      columns: 5,
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });

    gridMemoryPage2.addChild(grid);

    gridMemoryPage2.setup(() => {
      console.log("start gridMemoryPage2.setup() " + window.performance.now());

      // Advance to the next recall screen after "InterferenceTime" millisseconds
      gridMemoryPage2.run(
        Action.Sequence([
          Action.Wait({ duration: game.getParameter("InterferenceTime") }),
          Action.Custom({
            callback: () => {
              game.presentScene(gridMemoryPage3, previousScreenTransition);
            },
          }),
        ]),
        "advanceAfterInterference"
      );

      // While we're waiting until the "InterferenceTime" elapses via
      // the above action, start another action to show the grid of
      // E/F to tap
      gridMemoryPage2.run(
        Action.Custom({
          callback: () => {
            ShowInterferenceActivity();
          },
        })
      );

      // On repeated showings of the grid, we will slide it into view
      // and slideGridIntoScene = true
      function ShowInterferenceActivity(slideGridIntoScene = false) {
        grid.removeAllChildren();
        let tappedFCount = 0;

        // randomly choose six cells to have F in them from the grid that
        // is of size 8 rows and 5 columns
        const FCells = RandomDraws.FromGridWithoutReplacement(6, 8, 5);
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 5; j++) {
            const square = new Shape({
              rect: new Rect({ size: new Size(59, 59) }),
              fillColor: WebColors.Transparent,
            });
            square.userData = 0;

            let letterIsF = false;
            let letter: Label;
            letter = new Label({ text: "E", fontSize: 50 });
            for (let k = 0; k < 6; k++) {
              if (FCells[k].row === i && FCells[k].column === j) {
                letter = new Label({ text: "F", fontSize: 50 });
                letterIsF = true;
              }
            }

            if (letterIsF) {
              square.isUserInteractionEnabled = true;
              square.onTap(() => {
                if (square.userData === 0) {
                  tappedFCount++;
                  letter.text = "E";
                  letter.run(
                    Action.Sequence([
                      Action.Scale({ scale: 1.25, duration: 125 }),
                      Action.Scale({ scale: 1, duration: 125 }),
                    ])
                  );
                  square.userData = 1;
                  if (tappedFCount >= 6) {
                    // don't allow more taps on this current grid
                    grid.gridChildren.forEach((cell) => {
                      cell.entity.isUserInteractionEnabled = false;
                    });

                    // show a new interference grid
                    // but this time, slide it into view
                    ShowInterferenceActivity(true);
                  }
                }
              });
            }
            grid.addAtCell(letter, i, j);
            grid.addAtCell(square, i, j);
          }
        }

        if (slideGridIntoScene) {
          grid.position = new Point(200, 1040);
          grid.run(Action.Move({ point: new Point(200, 400), duration: 500 }));
        }
      }

      console.log("end gridMemoryPage2.setup() " + window.performance.now());
    });
    // SCENE: ask participant to recall the dot positions
    const gridMemoryPage3 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage3);

    const page3Message = new Label({
      text: "Where were the dots?",
      fontSize: 24,
      position: new Point(200, 150),
    });
    gridMemoryPage3.addChild(page3Message);

    const grid3 = new Grid({
      size: new Size(300, 300),
      position: new Point(200, 400),
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    gridMemoryPage3.addChild(grid3);

    let tappedCellCount = 0;

    gridMemoryPage3.setup(() => {
      grid3.removeAllChildren();

      tappedCellCount = 0;

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const cell = new Shape({
            // this rectangle will be the hit area for the cell
            // it's transparent -- we use it only for its hit
            // area. Make it 59 x 59 (not 60 x 60) to avoid overlap
            // of hit area on the borders
            rect: new Rect({ size: new Size(59, 59) }),
            fillColor: WebColors.Transparent,
          });
          // an entity's userData is a property we can use to store
          // anything we want. Here, we use it simply to keep track
          // of whether the cell has been tapped or not.
          cell.userData = 0;
          cell.onTap(() => {
            if (cell.userData === 0 && tappedCellCount < 3) {
              // cell has not been tapped, and there are not yet
              // 3 circles placed
              const circle = new Shape({
                circleOfRadius: 20,
                fillColor: WebColors.Red,
                strokeColor: WebColors.Black,
                lineWidth: 2,
              });
              cell.addChild(circle);
              cell.userData = 1;
              tappedCellCount++;
            } else if (cell.userData === 1) {
              // this cell has been tapped. Remove the circle from here
              cell.removeAllChildren();
              cell.userData = 0;
              tappedCellCount--;
            }
          });
          cell.isUserInteractionEnabled = true;
          grid3.addAtCell(cell, i, j);
        }
      }
    });

    const gridMemoryPage3DoneButton = new Button({
      text: "Done",
      position: new Point(200, 700),
      size: new Size(300, 50),
    });
    gridMemoryPage3.addChild(gridMemoryPage3DoneButton);

    // place this warning message on the scene, but hide it
    // we'll unhide it, if needed.
    const youMustSelectAllMessage = new Label({
      text: "You must select all 3 locations!",
      position: new Point(200, 600),
    });
    youMustSelectAllMessage.hidden = true;
    gridMemoryPage3.addChild(youMustSelectAllMessage);

    let gridMemoryTrialCount = 0;

    gridMemoryPage3DoneButton.isUserInteractionEnabled = true;
    gridMemoryPage3DoneButton.onTap(() => {
      if (tappedCellCount < 3) {
        youMustSelectAllMessage.run(
          Action.Sequence([
            Action.Custom({
              callback: () => {
                youMustSelectAllMessage.hidden = false;
              },
            }),
            Action.Wait({ duration: 3000 }),
            Action.Custom({
              callback: () => {
                youMustSelectAllMessage.hidden = true;
              },
            }),
          ])
        );
      } else {
        game.addTrialData("responseTime", 1000);
        game.addTrialData("correct", false);
        game.addTrialData("jsondata", { x: 1, y: 2, z: [1, 2, 3] });
        game.lifecycle.trialComplete(
          game.trialNumber,
          game.data,
          game.trialSchema
        );
        gridMemoryTrialCount++;
        game.trialNumber++;
        if (gridMemoryTrialCount === game.getParameter("TrialNum")) {
          game.presentScene(endPage, nextScreenTransition);
        } else {
          game.presentScene(gridMemoryPage0, nextScreenTransition);
        }
      }
    });

    // SCENE: placeholder end scene, with a button to restart it all again
    const endPage = new Scene();
    game.addScene(endPage);
    const doneLabel = new Label({
      text: `This will be reassigned in the setup() callback. If you see this, something went wrong!`,
      position: new Point(200, 300),
    });
    endPage.addChild(doneLabel);

    const againButton = new Button({
      text: "Start over",
      position: new Point(200, 400),
    });
    againButton.isUserInteractionEnabled = true;
    againButton.onTap(() => {
      gridMemoryTrialCount = 0;
      game.trialNumber = 0;
      game.presentScene(gridMemoryPage0);
    });
    endPage.addChild(againButton);

    endPage.setup(() => {
      doneLabel.text = `You did ${gridMemoryTrialCount} trials. You're done!`;
      console.log(`data are: ${JSON.stringify(game.data)}`);
      game.lifecycle.allTrialsComplete(game.data, game.trialSchema);
    });

    game.entryScene = "instructions-01";

    // This is commented out, so we can demo how game parameters can be set
    // outside of this code (this will be the approach when the code is
    // hosted in a mobile client app)
    // entry point of game
    //game.start("instructions-01");
  });
