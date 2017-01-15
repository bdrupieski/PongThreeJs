const Pong = (function() {

    const that = this;

    function setup(canvasId) {
        const sceneWidth = 640;
        const sceneHeight = 360;

        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setSize(sceneWidth, sceneHeight);

        that.camera = buildCamera(sceneWidth, sceneHeight);
        that.camera.position.z = 300;

        const scene = new THREE.Scene();
        scene.add(that.camera);
        scene.add(buildSphere());
        scene.add(buildLight());
        that.scene = scene;

        const canvas = document.getElementById(canvasId);
        canvas.appendChild(that.renderer.domElement);

        draw();
    }

    function draw() {
        that.renderer.render(that.scene, that.camera);
        requestAnimationFrame(draw);
    }

    function buildCamera(sceneWidth, sceneHeight) {
        const viewAngle = 90;
        const aspect = sceneWidth / sceneHeight;
        const near = 0.1;
        const far = 10000;

        return new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
    }

    function buildSphere() {
        const radius = 100;
        const segments = 32;
        const rings = 32;

        const sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xD43001
        });

        return new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
    }

    function buildLight() {
        const pointLight = new THREE.PointLight(0xFFFFFF);

        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 130;

        pointLight.intensity = 2;
        pointLight.distance = 10000;

        return pointLight;
    }

    return {
        setup: setup
    };

})();
