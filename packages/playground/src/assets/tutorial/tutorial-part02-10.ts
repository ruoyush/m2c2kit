import {
    Game,
    Action,
    Scene,
    Label,
    Shape,
    WebColors,
    RandomDraws,
    GameParameters,
    GameOptions,
    TrialSchema,
    Timer,
    Session,
    SessionLifecycleEvent,
    ActivityDataEvent,
    ActivityLifecycleEvent,
    LabelHorizontalAlignmentMode,
    RgbaColor,
    TransitionDirection,
    Transition,
    Easings
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class Tutorial extends Game {
    constructor() {

        const defaultParameters: GameParameters = {
        };

        const starterTrialSchema: TrialSchema = {
        };

        const options: GameOptions = {
            name: "Tutorial Part1",
            version: "0.0.1",
            id: "tut1",
            showFps: false,
            width: 400,
            height: 800,
            trialSchema: starterTrialSchema,
            parameters: defaultParameters,
            bodyBackgroundColor: WebColors.LightGray,
            fontUrls: ["assets/cli-starter/fonts/roboto/Roboto-Regular.ttf"],
        };

        super(options);
    }

    override init(): void {
        const game = this;

        const sceneOne = new Scene({ backgroundColor: WebColors.White });
        game.addScene(sceneOne);

        const square = new Shape({
            rect: { size: { width: 200, height: 200 } },
            position: { x: 200, y: 300 },
            fillColor: WebColors.PaleGreen,
            isUserInteractionEnabled: true
        });
        sceneOne.addChild(square);

        square.onTapDown(() => {
            console.log("you tapped!");
            if (message.hidden) {
                message.hidden = false;
            } else {
                message.hidden = true;
            }
        });

        const message = new Label({
            text: "Make me disappear!",
            position: { x: 200, y: 180 }
        });
        sceneOne.addChild(message);

        const nextButton = new Button({
            text: "Next",
            position: { x: 200, y: 600 },
            isUserInteractionEnabled: true
        });
        nextButton.onTapDown(() => {
            hello.hidden = true;
            game.presentScene(sceneTwo,
                Transition.slide({
                    duration: 2000,
                    direction: TransitionDirection.left,
                    easing: Easings.quadraticInOut
                }));
        });
        sceneOne.addChild(nextButton);

        const sceneTwo = new Scene({ backgroundColor: WebColors.AntiqueWhite });
        game.addScene(sceneTwo);

        const backButton = new Button({
            text: "Back",
            position: { x: 200, y: 600 },
            isUserInteractionEnabled: true
        });
        backButton.onTapDown(() => {
            game.presentScene(sceneOne,
                Transition.slide({
                    duration: 1000,
                    direction: TransitionDirection.right,
                    easing: Easings.exponentialInOut
                }));
        });
        sceneTwo.addChild(backButton);

        const circle = new Shape({
            circleOfRadius: 50,
            position: { x: 200, y: 400 }
        });
        sceneTwo.addChild(circle);

        const hello = new Label({
            text: "Hello",
            position: { x: 200, y: 300 },
            hidden: true
        });
        sceneTwo.addChild(hello);

        sceneTwo.onSetup(() => {
            console.log("Scene two onSetup()")
            if (Math.random() > .5) {
                circle.fillColor = WebColors.Red;
            } else {
                circle.fillColor = WebColors.Blue;
            }
        });

        sceneTwo.onAppear(() => {
            console.log("Scene two onAppear()")
            hello.hidden = false;
        });
    }
}

const activity = new Tutorial();
const session = new Session({
    activities: [activity],
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
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init().then(() => {
    const loaderDiv = document.getElementById("m2c2kit-loader-div");
    if (loaderDiv) {
        loaderDiv.classList.remove("m2c2kit-loader");
    }
});
