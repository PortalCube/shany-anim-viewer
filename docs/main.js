var lastFrameTime = Date.now() / 1000;
var canvas;
var shader;
var batcher;
var WebGL;
var mvp = new spine.webgl.Matrix4();
var assetManager;
var skeletonRenderer;
var shapes;
var skeletons = {};
var activeSkeleton = "sd/001/data";

let backgroundColor = [0, 0, 0];

const SpineList = ["sd", "stand"];

function Init() {
    // Setup canvas and WebGL context. We pass alpha: false to canvas.getContext() so we don't use premultiplied alpha when
    // loading textures. That is handled separately by PolygonBatcher.
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var config = { alpha: false };
    WebGL =
        canvas.getContext("webgl", config) ||
        canvas.getContext("experimental-webgl", config);
    if (!WebGL) {
        alert("WebGL is unavailable.");
        return;
    }

    // Create a simple shader, mesh, model-view-projection matrix and SkeletonRenderer.
    shader = spine.webgl.Shader.newColoredTextured(WebGL);

    skeletonRenderer = new spine.webgl.SkeletonRenderer(WebGL, false);
    assetManager = new spine.webgl.AssetManager(WebGL);
    batcher = new spine.webgl.PolygonBatcher(WebGL, false);
    shapes = new spine.webgl.ShapeRenderer(WebGL);


    mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);

    // Tell AssetManager to load the resources for each model, including the exported .json file, the .atlas file and the .png
    // file for the atlas. We then wait until all resources are loaded in the load() method.

    for (let subDir of SpineList) {
        for (let i = 0; i <= 23; i++) {
            const path = `assets/${subDir}/${_.padStart(i, 3, 0)}/data`;
            assetManager.loadText(`${path}.json`);
            assetManager.loadText(`${path}.atlas`);
            assetManager.loadTexture(`${path}.png`);
        }
    }

    requestAnimationFrame(Load);
}

function Load() {
    // Wait until the AssetManager has loaded all resources, then load the skeletons.
    if (assetManager.isLoadingComplete()) {
        for (let subDir of SpineList) {
            for (let i = 0; i <= 23; i++) {
                const path = `${subDir}/${_.padStart(i, 3, 0)}/data`;
                skeletons[path] = LoadSkeleton(
                    path,
                    subDir === "sd" && i == 0 ? "talk_wait" : "wait",
                    false,
                    subDir === "sd" ? "normal" : "default"
                );
            }
        }

        SetupUI();
        requestAnimationFrame(Render);
    } else {
        requestAnimationFrame(Load);
    }
}

function LoadSkeleton(name, initialAnimation, premultipliedAlpha, skin = "default") {
    // Load the texture atlas using name.atlas and name.png from the AssetManager.
    // The function passed to TextureAtlas is used to resolve relative paths.
    atlas = new spine.TextureAtlas(
        assetManager.get("assets/" + name + ".atlas"),
        function (path) {
            return assetManager.get(
                "assets/" + name.split("/").slice(0, 2).join("/") + "/" + path
            );
        }
    );

    // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
    atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    var skeletonJson = new spine.SkeletonJson(atlasLoader);

    // 불투명도 버그 수정
    const json = JSON.parse(assetManager.get("assets/" + name + ".json"));
    json.slots = json.slots.map((item) => {
        if (item.blend && item.name !== "eye_shadow_L") {
            delete item.blend;
        }
        return item;
    });

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    var skeletonData = skeletonJson.readSkeletonData(json);

    var skeleton = new spine.Skeleton(skeletonData);
    skeleton.setSkinByName(skin);
    var bounds = CalculateBounds(skeleton);

    // Create an AnimationState, and set the initial animation in looping mode.
    animationStateData = new spine.AnimationStateData(skeleton.data);
    var animationState = new spine.AnimationState(animationStateData);
    if (name == "spineboy") {
        animationStateData.setMix("walk", "jump", 0.4);
        animationStateData.setMix("jump", "run", 0.4);
        animationState.setAnimation(0, "walk", true);
        var jumpEntry = animationState.addAnimation(0, "jump", false, 3);
        animationState.addAnimation(0, "run", true, 0);
    } else {
        animationState.setAnimation(0, initialAnimation, true);
    }
    animationState.addListener({
        start: function (track) {
            console.log("Animation on track " + track.trackIndex + " started");
        },
        interrupt: function (track) {
            console.log("Animation on track " + track.trackIndex + " interrupted");
        },
        end: function (track) {
            console.log("Animation on track " + track.trackIndex + " ended");
        },
        disposed: function (track) {
            console.log("Animation on track " + track.trackIndex + " disposed");
        },
        complete: function (track) {
            console.log("Animation on track " + track.trackIndex + " completed");
        },
        event: function (track, event) {
            console.log(
                "Event on track " + track.trackIndex + ": " + JSON.stringify(event)
            );
        }
    });

    // Pack everything up and return to caller.
    return {
        skeleton: skeleton,
        state: animationState,
        bounds: bounds,
        premultipliedAlpha: premultipliedAlpha
    };
}

function CalculateBounds(skeleton) {
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform();
    var offset = new spine.Vector2();
    var size = new spine.Vector2();
    skeleton.getBounds(offset, size, []);
    return { offset: offset, size: size };
}

function SetupUI() {
    var skeletonList = $("#skeletonList");
    for (var skeletonName in skeletons) {
        var option = $("<option></option>");
        option.attr("value", skeletonName).text(skeletonName);
        if (skeletonName === activeSkeleton) option.attr("selected", "selected");
        skeletonList.append(option);
    }
    var setupAnimationUI = function () {
        var animationList = $("#animationList");
        animationList.empty();
        var skeleton = skeletons[activeSkeleton].skeleton;
        var state = skeletons[activeSkeleton].state;
        var activeAnimation = state.tracks[0].animation.name;
        for (var i = 0; i < skeleton.data.animations.length; i++) {
            var name = skeleton.data.animations[i].name;
            var option = $("<option></option>");
            option.attr("value", name).text(name);
            if (name === activeAnimation) option.attr("selected", "selected");
            animationList.append(option);
        }

        animationList.change(function () {
            var state = skeletons[activeSkeleton].state;
            var skeleton = skeletons[activeSkeleton].skeleton;
            var animationName = $("#animationList option:selected").text();
            skeleton.setToSetupPose();
            state.setAnimation(0, animationName, true);
        });
    };

    var setupSkinUI = function () {
        var skinList = $("#skinList");
        skinList.empty();
        var skeleton = skeletons[activeSkeleton].skeleton;
        var activeSkin = skeleton.skin == null ? "default" : skeleton.skin.name;
        for (var i = 0; i < skeleton.data.skins.length; i++) {
            var name = skeleton.data.skins[i].name;
            var option = $("<option></option>");
            option.attr("value", name).text(name);
            if (name === activeSkin) option.attr("selected", "selected");
            skinList.append(option);
        }

        skinList.change(function () {
            var skeleton = skeletons[activeSkeleton].skeleton;
            var skinName = $("#skinList option:selected").text();
            skeleton.setSkinByName(skinName);
            skeleton.setSlotsToSetupPose();
        });
    };

    skeletonList.change(function () {
        activeSkeleton = $("#skeletonList option:selected").text();
        setupAnimationUI();
        setupSkinUI();
    });
    setupAnimationUI();
    setupSkinUI();
}

function Render() {
    var now = Date.now() / 1000;
    var delta = now - lastFrameTime;
    lastFrameTime = now;

    // Update the MVP matrix to adjust for canvas size changes
    Resize();

    WebGL.clearColor(...backgroundColor, 1);
    WebGL.clear(WebGL.COLOR_BUFFER_BIT);

    // Apply the animation state based on the delta time.
    var state = skeletons[activeSkeleton].state;
    var skeleton = skeletons[activeSkeleton].skeleton;
    var premultipliedAlpha = skeletons[activeSkeleton].premultipliedAlpha;
    state.update(delta);
    state.apply(skeleton);
    skeleton.updateWorldTransform();

    // Bind the shader and set the texture and model-view-projection matrix.
    shader.bind();
    shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
    shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);

    // Start the batch and tell the SkeletonRenderer to render the active skeleton.
    batcher.begin(shader);
    skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
    skeletonRenderer.draw(batcher, skeleton);
    batcher.end();

    shader.unbind();

    requestAnimationFrame(Render);
}

function Resize() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    var bounds = skeletons[activeSkeleton].bounds;
    if (canvas.width != w || canvas.height != h) {
        canvas.width = w;
        canvas.height = h;
    }

    // magic
    var centerX = bounds.offset.x + bounds.size.x / 2;
    var centerY = bounds.offset.y + bounds.size.y / 2;
    var scaleX = bounds.size.x / canvas.width;
    var scaleY = bounds.size.y / canvas.height;
    var scale = Math.max(scaleX, scaleY) * 1.2;
    if (scale < 1) scale = 1;
    var width = canvas.width * scale;
    var height = canvas.height * scale;

    mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
    WebGL.viewport(0, 0, canvas.width, canvas.height);
}

function HexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? result.slice(1,4).map((item) => {
              return parseInt(item, 16) / 255;
          })
        : null;
}

const colorPicker = document.querySelector("#color-picker");
colorPicker.addEventListener(
    "change",
    (event) => {
        backgroundColor = HexToRgb(event.target.value);
    },
    false
);

Init();
