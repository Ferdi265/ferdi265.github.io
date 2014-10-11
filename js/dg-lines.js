var //constants
	WIDTH = 600,
	HEIGHT = 600,
	ANGLE = 45,
	NEAR = 10,
	FAR = 1000,
	//contexts
	scene = new THREE.Scene(),
	//camera = new THREE.PerspectiveCamera(ANGLE, WIDTH/HEIGHT, NEAR, FAR),
	camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, NEAR, FAR),
	renderer = new THREE.WebGLRenderer({antialiasing: true}),
	//variables   
	objects = {},
	theta = 0,
	phi = 0,
	mouseDown = false,
	mouseX = 0,
	mouseY = 0,
	mouseTheta = 0,
	mousePhi = 0,
	//functions
	wireframeLine = function (geom) {
		var lineGeometry = new THREE.Geometry(),
			lineVertices = lineGeometry.vertices,
			sortFunction = function (a, b) { 
				return a - b;
			},
			edge = [0, 0],
			hash = {},
			keys = ['a', 'b', 'c'],
			geomVertices = geom.vertices,
			geomFaces = geom.faces,
			numEdges = 0;
		for (var i = 0, l = geomFaces.length; i < l; i++) {
			var face = geomFaces[i];
			for (var j = 0; j < 3; j++) {
				edge[0] = face[keys[j]];
				edge[1] = face[keys[(j + 1) % 3]];
				edge.sort(sortFunction);
				var k = edge.toString();
				if (hash[k] === undefined) {
					hash[k] = { 
						vert1: edge[0],
						vert2: edge[1],
						face1: i,
						face2: undefined
					};
					numEdges++;
				} else {
					hash[k].face2 = i;
				}
			}
		}
		geom.computeFaceNormals();
		for (var key in hash) {
			var h = hash[key];
			if (h.face2 === undefined || geomFaces[h.face1].normal.dot(geomFaces[h.face2].normal) < 0.9999) {
				lineVertices.push(geomVertices[h.vert1].clone(), geomVertices[h.vert2].clone());
			}
		}
		lineGeometry.computeLineDistances();
		return lineGeometry;
	},
	seeThrough = function (geom, matDashed, matSolid, matMesh) {
		var o = new THREE.Object3D(),
			dashed = new THREE.Line(wireframeLine(geom), matDashed || new THREE.LineBasicMaterial({
				color: 0x000000,
				depthTest: true,
			}), THREE.LinePieces),
			solid = new THREE.Line(wireframeLine(geom), matSolid || new THREE.LineDashedMaterial({
				color: 0x666666,
				dashSize: 2,
				gapSize: 3,
				depthTest: false,
			}), THREE.LinePieces),
			mesh = new THREE.Mesh(geom, matMesh || new THREE.MeshBasicMaterial({
				color: 0xffffff,
				side: THREE.DoubleSide,
				depthTest: true,
				polygonOffset: true,
				polygonOffsetFactor: 1,
				polygonOffsetUnits: 1
			}));
		o.add(dashed);
		o.add(solid);
		o.add(mesh);
		return o;
	},
	seeThroughLine = function (lineGeom, matDashed, matSolid) {
		var o = new THREE.Object3D(),
			dashed = new THREE.Line(lineGeom, matDashed || new THREE.LineBasicMaterial({
				color: 0x000000,
				depthTest: true,
			}), THREE.LinePieces),
			solid = new THREE.Line(lineGeom, matSolid || new THREE.LineDashedMaterial({
				color: 0x666666,
				dashSize: 2,
				gapSize: 3,
				depthTest: false,
			}), THREE.LinePieces);
		o.add(dashed);
		o.add(solid);
		return o;
	},
	lineGeom = function (from, to) {
		var geom = new THREE.Geometry(),
			vertices = geom.vertices;
		vertices.push(from, to);
		geom.computeLineDistances();
		return geom;
	},
	axisIndicators = function (opt) {
		var indicators = new THREE.Object3D();
		opt = opt || {};
		opt.x = opt.x || {};
		opt.y = opt.y || {};
		opt.z = opt.z || {};
		indicators.add(seeThroughLine(lineGeom(new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0, 0)), opt.x.solid || new THREE.LineBasicMaterial({
			color: 0xff0000,
			depthTest: true,
		}), opt.x.dashed || new THREE.LineDashedMaterial({
			color: 0x660000,
			dashSize: 2,
			gapSize: 3,
			depthTest: false,
		})));
		indicators.add(seeThroughLine(lineGeom(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0)), opt.y.solid || new THREE.LineBasicMaterial({
			color: 0x00ff00,
			depthTest: true,
		}), opt.y.dashed || new THREE.LineDashedMaterial({
			color: 0x006600,
			dashSize: 2,
			gapSize: 3,
			depthTest: false,
		})));
		indicators.add(seeThroughLine(lineGeom(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 100)), opt.z.solid || new THREE.LineBasicMaterial({
			color: 0x0000ff,
			depthTest: true,
		}), opt.z.dashed || new THREE.LineDashedMaterial({
			color: 0x000066,
			dashSize: 2,
			gapSize: 3,
			depthTest: false,
		})));
		return indicators;
	};

document.addEventListener('mousedown', function (e) {
	if (e.which === 1) {
		mouseDown = true;
		mouseX = e.clientX;
		mouseY = e.clientY;
		mouseTheta = theta;
		mousePhi = phi;
	}
});
document.addEventListener('mouseup', function (e) {
	if (e.which === 1) {
		mouseDown = false;
	}
});
document.addEventListener('mousemove', function (e) {
	if (mouseDown) {
		theta = -((e.clientX - mouseX) * 0.5) + mouseTheta;
		phi = Math.min(180, Math.max(-180, ((e.clientY - mouseY) * 0.5) + mousePhi));
		camera.position.x = 300 * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
		camera.position.y = 300 * Math.sin(phi * Math.PI / 360);
		camera.position.z = 300 * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
		camera.lookAt(new THREE.Vector3(-camera.position.x, -camera.position.y, -camera.position.z).normalize());
		camera.updateMatrix();
	}
});

(function setup() {
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0xffffff);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 300;
	camera.lookAt(new THREE.Vector3(0, 0, -1));
	document.querySelector('.three').appendChild(renderer.domElement);

	//add axis Indicators
	objects.axisIndicators = axisIndicators();
	objects.axisIndicators.visible = $('#axisIndicators').get(0).checked;
	scene.add(objects.axisIndicators);

	//add objects
	var threeCubeBig = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100)),
		threeCubeSmall = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50));
	threeCubeSmall.position.set(25, 25, 25);
	var csgCubeBig = new ThreeBSP(threeCubeBig),
		csgCubeSmall = new ThreeBSP(threeCubeSmall),
		csgSub = csgCubeBig.subtract(csgCubeSmall),
		threeGeom = csgSub.toGeometry();
	objects.cutCube = seeThrough(threeGeom);
	scene.add(objects.cutCube);
})();

(function animate() {
	requestAnimationFrame(animate);
	
	//animate objects
	
	renderer.render(scene, camera);
})();

$(function () {
	$('#axisIndicators').change(function () {
		if (objects.axisIndicators) {
			objects.axisIndicators.visible = this.checked;
		}
	});
});