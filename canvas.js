
var lastFrameTime = Date.now() / 1000;
var canvas, context;
var assetManager;
var skeletonRenderer;
var skeletons = {};
var activeSkeleton = "sd/001/data";
const SpineList = ["sd", "stand"];

var skelName = "spineboy-ess";
var animName = "walk";

function init () {
	canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context = canvas.getContext("2d");

	skeletonRenderer = new spine.canvas.SkeletonRenderer(context);
	// enable debug rendering
	skeletonRenderer.debugRendering = true;
	// enable the triangle renderer, supports meshes, but may produce artifacts in some browsers
	skeletonRenderer.triangleRendering = false;

	assetManager = new spine.canvas.AssetManager();

	for (let dir of SpineList) {
        for (let i = 1; i <= 23; i++) {
            assetManager.loadText(`assets/${dir}/${_.padStart(i, 3, 0)}/data.json`);
            assetManager.loadText(`assets/${dir}/${_.padStart(i, 3, 0)}/data.atlas`);
            assetManager.loadTexture(`assets/${dir}/${_.padStart(i, 3, 0)}/data.png`);
        }
    }

	// assetManager.loadText("assets/" + skelName + ".json");
	// assetManager.loadText("assets/" + skelName.replace("-pro", "").replace("-ess", "") + ".atlas");
	// assetManager.loadTexture("assets/" + skelName.replace("-pro", "").replace("-ess", "") + ".png");

	requestAnimationFrame(load);
}

function load () {
	if (assetManager.isLoadingComplete()) {

		for (let dir of SpineList) {
            for (let i = 1; i <= 23; i++) {
                skeletons[`${dir}/${_.padStart(i, 3, 0)}/data`] = loadSkeleton(`${dir}/${_.padStart(i, 3, 0)}/data`, "wait", dir === "sd" ? "normal" : "default");
            }
        }

		// var data = loadSkeleton(skelName, animName, "default");
		// skeleton = data.skeleton;
		// state = data.state;
		// bounds = data.bounds;
		setupUI();
		requestAnimationFrame(render);
	} else {
		requestAnimationFrame(load);
	}
}

function loadSkeleton (name, initialAnimation, skin) {
	if (skin === undefined) skin = "default";

	// Load the texture atlas using name.atlas and name.png from the AssetManager.
	// The function passed to TextureAtlas is used to resolve relative paths.
	atlas = new spine.TextureAtlas(assetManager.get("assets/" + name + ".atlas"), function(path) {
		return assetManager.get("assets/" + name.split("/").slice(0, 2).join("/") + "/" + path);
	});

	// Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
	atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonJson instance for parsing the .json file.
	var skeletonJson = new spine.SkeletonJson(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	var skeletonData = skeletonJson.readSkeletonData(assetManager.get("assets/" + name + ".json"));
	var skeleton = new spine.Skeleton(skeletonData);
	skeleton.flipY = true;
	var bounds = calculateBounds(skeleton);
	skeleton.setSkinByName(skin);

	// Create an AnimationState, and set the initial animation in looping mode.
	var animationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
	animationState.setAnimation(0, initialAnimation, true);
	animationState.addListener({
		event: function(trackIndex, event) {
			// console.log("Event on track " + trackIndex + ": " + JSON.stringify(event));
		},
		complete: function(trackIndex, loopCount) {
			// console.log("Animation on track " + trackIndex + " completed, loop count: " + loopCount);
		},
		start: function(trackIndex) {
			// console.log("Animation on track " + trackIndex + " started");
		},
		end: function(trackIndex) {
			// console.log("Animation on track " + trackIndex + " ended");
		}
	})

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds };
}

function calculateBounds(skeleton) {
	var data = skeleton.data;
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform();
	var offset = new spine.Vector2();
	var size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}


function setupUI () {
	var skeletonList = $("#skeletonList");
	for (var skeletonName in skeletons) {
		var option = $("<option></option>");
		option.attr("value", skeletonName).text(skeletonName);
		if (skeletonName === activeSkeleton) option.attr("selected", "selected");
		skeletonList.append(option);
	}
	var setupAnimationUI = function() {
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

		animationList.change(function() {
			var state = skeletons[activeSkeleton].state;
			var skeleton = skeletons[activeSkeleton].skeleton;
			var animationName = $("#animationList option:selected").text();
			skeleton.setToSetupPose();
			state.setAnimation(0, animationName, true);
		})
	}

	var setupSkinUI = function() {
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

		skinList.change(function() {
			var skeleton = skeletons[activeSkeleton].skeleton;
			var skinName = $("#skinList option:selected").text();
			skeleton.setSkinByName(skinName);
			skeleton.setSlotsToSetupPose();
		})
	}

	skeletonList.change(function() {
		activeSkeleton = $("#skeletonList option:selected").text();
		setupAnimationUI();
		setupSkinUI();
	})
	setupAnimationUI();
	setupSkinUI();
}

function render () {
	var now = Date.now() / 1000;
	var delta = now - lastFrameTime;
	lastFrameTime = now;

	resize();

	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.fillStyle = "#cccccc";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.restore();

	var state = skeletons[activeSkeleton].state;
	var skeleton = skeletons[activeSkeleton].skeleton;

	state.update(delta);
	state.apply(skeleton);
	skeleton.updateWorldTransform();
	skeletonRenderer.draw(skeleton);

	context.strokeStyle = "green";
	context.beginPath();
	context.moveTo(-1000, 0);
	context.lineTo(1000, 0);
	context.moveTo(0, -1000);
	context.lineTo(0, 1000);
	context.stroke();

	requestAnimationFrame(render);
}

function resize () {
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
	
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.scale(1 / scale, 1 / scale);
	context.translate(-centerX, -centerY);
	context.translate(width / 2, height / 2);
}

init();