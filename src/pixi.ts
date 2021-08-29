import { Application, Text, Loader, LoaderResource } from "pixi.js";
import { Spine } from "pixi-spine";

export default class App extends Application {
    spineObject: Spine;
    textObject: Text;

    constructor() {
        super({
            width: window.innerWidth,
            height: window.innerHeight
        });

        document.body.appendChild(this.view);

        this.init();
    }

    init(): void {
        this.loader.add(
            "idol",
            // "https://storage.prisism.io/sc/spine/idols/stand/1040010010/data.json"
            "https://storage.prisism.io/sc/spine/characters/cb/001/data.json"
        );
        this.loader.load(this.draw.bind(this));

        window.addEventListener("resize", this.onResize.bind(this));
    }

    draw(loader: Loader, resources: Dict<LoaderResource>): void {
        this.spineObject = new Spine(resources.idol.spineData);
        try {
            this.spineObject.skeleton.setSkinByName("normal");
        } catch (e) {
            this.spineObject.skeleton.setSkinByName("default");
        }

        this.spineObject.state.setAnimation(0, "wait", true);
        this.textObject = new Text("", {
            fontSize: 16,
            fontFamily: "Gosanja",
            fill: "#94ddff"
        });
        this.stage.addChild(this.spineObject);
        this.stage.addChild(this.textObject);
        this.onResize();
    }

    onResize(): void {
        if (!this.spineObject) {
            return;
        }

        const width: number = window.innerWidth;
        const height: number = window.innerHeight;
        const spineX: number = Math.round(width * 0.5);
        const spineY: number = Math.round(height * 0.6);

        this.renderer.resize(width, height);
        
        if (height > width) {
            this.spineObject.scale.set(width / 1200);
        } else {
            this.spineObject.scale.set(height / 1200);
        }

        this.spineObject.position.set(spineX, spineY);

        this.textObject.text = [
            `[Window] width: ${width}, height: ${height}, scale: ${window.devicePixelRatio}`,
            `[Spine] x: ${spineX}, y: ${spineY}`
        ].join("\n");
    }
}
