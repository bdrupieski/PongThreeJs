const Pong = (function() {

    const that = this;

    const sceneWidth = 640;
    const sceneHeight = 360;

    const fieldWidth = sceneWidth * 0.95;
    const fieldHeight = sceneHeight;

    const paddleWidth = 10;
    const paddleHeight = 80;
    const paddleDepth = 10;
    const paddleQuality = 1;
    const paddleSpeed = 4;

    let ballDirX = 1;
    let ballDirY = 1;

    function setup(canvasId) {

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(sceneWidth, sceneHeight);
        that.renderer = renderer;

        that.camera = buildCamera();
        that.ball = buildSphere();

        const scene = new THREE.Scene();

        scene.add(that.camera);
        scene.add(that.ball);
        scene.add(buildLight());
        scene.add(buildPlane());

        that.paddle1 = buildPaddle(0x1B32C0);
        that.paddle2 = buildPaddle(0xFF4045);

        that.paddle1.position.x = -fieldWidth / 2 + paddleWidth;
        that.paddle2.position.x = fieldWidth / 2 - paddleWidth;

        scene.add(paddle1);
        scene.add(paddle2);

        that.scene = scene;

        const canvas = document.getElementById(canvasId);
        canvas.appendChild(that.renderer.domElement);

        draw();
    }

    function draw() {
        that.renderer.render(that.scene, that.camera);
        requestAnimationFrame(draw);
        ballPhysics(that.ball, function() {}, function() {});
        playerPaddleMovement(that.paddle1);
    }

    function buildCamera() {
        const viewAngle = 90;
        const aspect = sceneWidth / sceneHeight;
        const near = 0.1;
        const far = 10000;

        const camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
        camera.position.z = 200;
        return camera;
    }

    function buildSphere() {
        const radius = 10;
        const segments = 32;
        const rings = 32;

        const sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xD43001
        });

        return new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
    }

    function buildLight() {
        const pointLight = new THREE.PointLight(0xFFFFFF);

        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = 300;

        pointLight.intensity = 1.4;
        pointLight.distance = 10000;

        return pointLight;
    }

    function buildPlane() {

        const planeWidth = fieldWidth;
        const planeHeight = fieldHeight;
        const planeQuality = 10;

        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x4BD121
        });
        const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, planeQuality, planeQuality);

        return new THREE.Mesh(planeGeometry, planeMaterial);
    }

    function buildPaddle(paddleColor) {
        const paddleMaterial = new THREE.MeshLambertMaterial({
            color: paddleColor
        });

        const paddleGeometry = new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality);
        const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        paddle.position.z = paddleDepth;
        return paddle;
    }

    function ballPhysics(ball, onCpuScore, onPlayerScore) {

        const ballSpeed = 2;

        if (ball.position.x <= -fieldWidth / 2) {
            resetBall();
            onCpuScore();
        }

        if (ball.position.x >= fieldWidth / 2) {
            resetBall();
            onPlayerScore();
        }

        if (ball.position.y <= -fieldHeight / 2) {
            ballDirY = -ballDirY;
        }
        if (ball.position.y >= fieldHeight / 2) {
            ballDirY = -ballDirY;
        }

        ball.position.x += ballDirX * ballSpeed;
        ball.position.y += ballDirY * ballSpeed;

        if (ballDirY > ballSpeed * 2) {
            ballDirY = ballSpeed * 2;
        }
        else if (ballDirY < -ballSpeed * 2) {
            ballDirY = -ballSpeed * 2;
        }
    }

    function playerPaddleMovement(paddle) {
        let paddle1DirY = 0;

        if (Key.isDown(Key.A)) {
            if (paddle.position.y < fieldHeight * 0.45) {
                paddle1DirY = paddleSpeed * 0.5;
            }
            else {
                paddle.scale.z += (10 - paddle.scale.z) * 0.2;
            }

        } else if (Key.isDown(Key.D)) {
            if (paddle.position.y > -fieldHeight * 0.45) {
                paddle1DirY = -paddleSpeed * 0.5;
            }
            else {
                paddle.scale.z += (10 - paddle.scale.z) * 0.2;
            }
        }

        paddle.position.y += paddle1DirY;
    }

    function resetBall() {
        ball.position.x = 0;
        ball.position.y = 0;

        ballDirX = -ballDirX;
    }

    return {
        setup: setup
    };

})();
