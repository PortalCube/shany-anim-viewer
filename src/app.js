import { Application } from "pixi.js";
import { Spine } from "pixi-spine";

function ResizeSpine(renderer, spine) {
    renderer.resize(window.innerWidth, window.innerHeight - 4);
    if (window.innerHeight > window.innerWidth) {
        spine.scale.set(window.innerWidth / 1200);
    } else {
        spine.scale.set(window.innerHeight / 1200);
    }
    spine.position.set(window.innerWidth * 0.5, window.innerHeight * 0.6);
}

export default class App extends Application {
    constructor() {
        super({
            width: window.innerWidth,
            height: window.innerHeight - 4
            // backgroundColor: 0x000000
        });

        document.body.appendChild(this.view);

        this.init();
    }

    init() {
        this.loader.add(
            "idol",
            "https://storage.prisism.io/sc/spine/idols/stand/1030080020/data.json"
            // "https://storage.prisism.io/sc/spine/characters/stand/008/data.json"
        );
        this.loader.load(this.draw.bind(this));
        window.addEventListener("resize", this.onResize.bind(this));
    }

    draw(loader, resources) {
        this.idol = new Spine(this.loader.resources.idol.spineData);
        try {
            this.idol.skeleton.setSkinByName("normal");
        } catch (e) {
            this.idol.skeleton.setSkinByName("default");
        }

        this.idol.state.setAnimation(0, "wait", true);
        this.stage.addChild(this.idol);
        ResizeSpine(this.renderer, this.idol);
    }

    onResize() {
        if (!this.idol) {
            return;
        }

        ResizeSpine(this.renderer, this.idol);
    }
}
