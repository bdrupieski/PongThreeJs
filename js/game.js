const Pong = (function() {

    const that = this;

    const sceneWidth = 640;
    const sceneHeight = 360;

    const fieldWidth = sceneWidth * 0.95;
    const fieldHeight = sceneHeight;

    const paddleWidth = 10;
    const paddleHeight = 80;
    const paddleDepth = 30;
    const paddleQuality = 1;
    const paddleSpeed = 10;

    const ballSpeed = 6;

    let ballDirX = 1;
    let ballDirY = 1;

    let player1Score = 0;
    let player2Score = 0;

    function setup(canvasId, player1ScoreId, player2ScoreId) {
        that.player1ScoreId = player1ScoreId;
        that.player2ScoreId = player2ScoreId;

        const renderer = new THREE.WebGLRenderer();
        renderer.shadowMap.enabled = true;
        renderer.setSize(sceneWidth, sceneHeight);
        that.renderer = renderer;

        that.camera = buildCamera();
        that.ball = buildSphere();
        that.pointLight = buildPointLight();
        that.spotLight = buildSpotLight();
        that.plane = buildPlane();

        const scene = new THREE.Scene();

        scene.add(that.camera);
        scene.add(that.ball);
        scene.add(that.pointLight);
        scene.add(that.spotLight);
        scene.add(that.plane);
        scene.add(buildTable());
        scene.add(buildGround());

        for (let pillar of buildPillars()) {
            scene.add(pillar);
        }

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
        ballPhysics(that.ball, playerScored, cpuScored);
        playerPaddleMovement(that.paddle1);
        opponentPaddleMovement(that.paddle2);
        paddlePhysics(that.paddle1);
        paddlePhysics(that.paddle2);
        cameraPhysics();
    }

    function playerScored() {
        player1Score++;
        document.getElementById(that.player1ScoreId).textContent = player1Score;
    }

    function cpuScored() {
        player2Score++;
        document.getElementById(that.player2ScoreId).textContent = player2Score;
    }

    function buildCamera() {
        const viewAngle = 90;
        const aspect = sceneWidth / sceneHeight;
        const near = 0.1;
        const far = 10000;

        return new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
    }

    function buildSphere() {
        const radius = 10;
        const segments = 32;
        const rings = 32;

        const sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xD43001
        });

        const ball = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);

        ball.position.z = radius;
        ball.receiveShadow = true;
        ball.castShadow = true;

        return ball;
    }

    function buildPointLight() {
        const pointLight = new THREE.PointLight(0xFFFFFF);

        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = 300;

        pointLight.intensity = 1.4;
        pointLight.distance = 10000;

        return pointLight;
    }

    function buildSpotLight() {
        const spotLight = new THREE.SpotLight(0xF8D898);
        spotLight.position.set(0, 0, 460);
        spotLight.intensity = 1.5;
        spotLight.castShadow = true;
        return spotLight;
    }

    function buildGround() {
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x8054AC
        });
        const cubeGeometry = new THREE.CubeGeometry(1000, 1000, 3, 1, 1, 1);
        const ground = new THREE.Mesh(cubeGeometry, groundMaterial);
        ground.position.z = -132;
        ground.receiveShadow = true;
        return ground;
    }

    function buildPlane() {

        const planeWidth = fieldWidth;
        const planeHeight = fieldHeight;
        const planeQuality = 10;

        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x4BD121
        });
        const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, planeQuality, planeQuality);
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        return plane;
    }

    function buildTable() {
        const tableMaterial = new THREE.MeshLambertMaterial({
            color: 0x111111
        });
        const cubeGeometry = new THREE.CubeGeometry(fieldWidth * 1.05, fieldHeight * 1.03, 100, 10, 10, 1);
        const table = new THREE.Mesh(cubeGeometry, tableMaterial);
        table.position.z = -51;
        table.receiveShadow = true;
        return table;
    }

    function buildPillars() {

        const pillarMaterial = new THREE.MeshLambertMaterial({
            color: 0x534d0d
        });
        const count = 10;

        function pillarsForY(y) {
            const pillars = [];

            for (let i = 0; i < count; i++) {
                const cubeGeometry = new THREE.CubeGeometry(30, 30, 500, 1, 1, 1);
                const pillar = new THREE.Mesh(cubeGeometry, pillarMaterial);

                const spacing = (fieldWidth / count) * i;
                pillar.position.x = spacing - (fieldWidth / 2);
                pillar.position.y = y;
                pillar.position.z = 0;
                pillar.castShadow = true;
                pillar.receiveShadow = true;
                pillars.push(pillar);
            }
            return pillars;
        }

        return [...pillarsForY(250), ...pillarsForY(-250)];
    }

    function buildPaddle(paddleColor) {
        const paddleMaterial = new THREE.MeshLambertMaterial({
            color: paddleColor
        });

        const paddleGeometry = new THREE.CubeGeometry(paddleWidth, paddleHeight, paddleDepth, paddleQuality, paddleQuality, paddleQuality);
        const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        paddle.position.z = paddleDepth;
        paddle.receiveShadow = true;
        paddle.castShadow = true;
        return paddle;
    }

    function ballPhysics(ball, onCpuScore, onPlayerScore) {

        if (ball.position.x <= -fieldWidth / 2) {
            resetBall();
            onPlayerScore();
        }

        if (ball.position.x >= fieldWidth / 2) {
            resetBall();
            onCpuScore();
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

        if (Key.isDown(Key.A) && paddle.position.y < fieldHeight * 0.45) {
            paddle1DirY = paddleSpeed * 0.5;
        } else if (Key.isDown(Key.D) && paddle.position.y > -fieldHeight * 0.45) {
            paddle1DirY = -paddleSpeed * 0.5;
        }

        paddle.position.y += paddle1DirY;
    }

    function opponentPaddleMovement(paddle) {
        const paddle2DirY = (ball.position.y - paddle.position.y) * 0.13;

        if (Math.abs(paddle2DirY) <= paddleSpeed) {
            paddle.position.y += paddle2DirY;
        }
        else {
            if (paddle2DirY > paddleSpeed) {
                paddle.position.y += paddleSpeed;
            }
            else if (paddle2DirY < -paddleSpeed) {
                paddle.position.y -= paddleSpeed;
            }
        }
        paddle.scale.y += (1 - paddle.scale.y) * 0.2;
    }

    function resetBall() {
        ball.position.x = 0;
        ball.position.y = 0;

        ballDirX = -ballDirX;
    }

    function paddlePhysics(paddle) {

        function boundsCheck() {
            if (paddle == that.paddle1) {
                return ballDirX < 0;
            } else {
                return ballDirX > 0;
            }
        }

        if (ball.position.x <= paddle.position.x + paddleWidth &&
            ball.position.x >= paddle.position.x) {

            if (ball.position.y <= paddle.position.y + paddleHeight / 2 &&
                ball.position.y >= paddle.position.y - paddleHeight / 2) {

                if (boundsCheck()) {
                    ballDirX = -ballDirX;
                }
            }
        }
    }

    function cameraPhysics() {
        that.pointLight.position.x = that.ball.position.x * 2;
        that.pointLight.position.y = that.ball.position.y * 2;

        // move to behind the player's paddle
        that.camera.position.x = that.paddle1.position.x - 80;
        that.camera.position.y += (that.paddle1.position.y - that.camera.position.y) * 0.05;
        that.camera.position.z = that.paddle1.position.z + 180 + 0.04 * (-that.ball.position.x + that.paddle1.position.x);

        // rotate to face towards the opponent
        that.camera.rotation.x = -0.01 * (that.ball.position.y) * Math.PI / 180;
        that.camera.rotation.y = -60 * Math.PI / 180;
        that.camera.rotation.z = -90 * Math.PI / 180;
    }

    return {
        setup: setup
    };

})();
