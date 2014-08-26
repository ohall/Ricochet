(function (ns) {
    'use strict';

    ns.app.controller('MainCtrl', function ($scope, $interval, LevelService) {
            var BALL_RADIUS = 5,
                UPDATE_INTERVAL = 1000 / 60,
                bounceFactor = 0.1;


            $scope.init = function () {
                $scope.canvas = document.getElementById('gameCanvas');
                $scope.canvas.width = 350;
                $scope.canvas.height = 700;
                $scope.gamemode = 'game';
                $scope.running = false;

                $scope.context = $scope.canvas.getContext('2d');
                var attrs = {
                    color: 'blue',
                    name: 'hero',
                    x: $scope.canvas.width / 2,
                    y: $scope.canvas.height / 2,
                    radius: BALL_RADIUS,
                    vx: 300,
                    vy: 300,
                    dx: 10,
                    dy: 10,
                    context: $scope.context
                };
                $scope.ball = new Ball(attrs);

                var triattrs = {
                    vert1: [100, 75],
                    vert2: [100, 25],
                    vert3: [75, 50]
                };

                _.forEach(LevelService.triangles(),function(atr){
                    $scope.tri = new Tri(atr);
                });
            };

            $scope.down = function (event) {
                if (!$scope.running) {
                    $scope.context.beginPath();
                    $scope.context.moveTo($scope.ball.x, $scope.ball.y);
                    $scope.context.lineTo(event.offsetX, event.offsetY);
                    $scope.line = $scope.context.stroke();
                }
            };

            $scope.up = function (event) {
                if (!$scope.running) {
                    $scope.line = null;
                    aimAtTarget($scope.ball, event.offsetX, event.offsetY);
                    $scope.start();
                }
            };

            $scope.win = function () {
                $scope.stop();
                $scope.gamemode = 'win';
                $interval($scope.reset, 1000, 1);
            };

            $scope.reset = function () {
                $scope.init();
            };


            var aimAtTarget = function (ball, targetx, targety) {
                ball.target = {x: targetx, y: targety};
                ball.dx = (targetx - ball.x) * ( bounceFactor);
                ball.dy = (targety - ball.y) * (-bounceFactor);
            };

            var clearCanvas = function (ctx) {
                if (ctx) {
                    ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
                }
            };

            var update = function () {
                clearCanvas($scope.context);
                if ($scope.ball) {
                    var contact = collision($scope.ball, $scope.canvas, $scope.tri);

                    if (contact.exit) {
                        $scope.win();
                        return;
                    }

                    if (contact.left || contact.right) {
                        $scope.ball.vx *= -bounceFactor;
                        $scope.ball.dx = -$scope.ball.dx;
                    }
                    if (contact.bottom) {
                        $scope.ball.vy *= -bounceFactor;
                        $scope.ball.dy = -$scope.ball.dy;
                    }
                    $scope.ball.x += $scope.ball.dx;
                    $scope.ball.y -= $scope.ball.dy;
                    $scope.ball.drawit();
                }

                if ($scope.tri) {
                    $scope.tri.drawit();
                }

            };

            $scope.stop = function () {
                $interval.cancel($scope.updates);
                $scope.running = false;
            };

            $scope.start = function () {
                $scope.updates = $interval(update, UPDATE_INTERVAL);
                $scope.running = true;
            };

            /**
             * Utils
             */
            var getBallatEdgeCoord = function (ballRadius, edgeLoc) {
                return( edgeLoc === 0 ) ? ballRadius : (edgeLoc - ballRadius);
            };

            var collision = function (ball, canvas, tri) {
                var contact = {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false,
                    exit:false
                };
                if (ball.y <= getBallatEdgeCoord(BALL_RADIUS, 0)) {
                    contact.exit = true;
                }
                if (ball.y >= getBallatEdgeCoord(BALL_RADIUS, canvas.height)) {
                    contact.bottom = true;
                }
                if (ball.x <= getBallatEdgeCoord(BALL_RADIUS, 0)) {
                    contact.left = true;
                }
                if (ball.x >= getBallatEdgeCoord(BALL_RADIUS, canvas.width)) {
                    contact.right = true;
                }

                if(ball.y <= tri.ymax && ball.x <= tri.xmax && ball.x >= tri.xmin ) {
                    contact.bottom = true;
                }else if(ball.y >= tri.ymin && ball.x <= tri.xmax && ball.x >= tri.xmin ){
                    contact.top = true;
                }else if(ball.x <= tri.xmax && ball.y <= tri.ymax && ball.y >= tri.ymin ){
                    contact.right = true;
                }else if(ball.x >= tri.xmin && ball.y <= tri.ymax && ball.y >= tri.ymin ){
                    contact.left = true;
                }
                return contact;
            };

            /**
             * Classes
             */
            var Ball = function(attrs){
                this.color = attrs.color;
                this.name = attrs.name;
                this.x = attrs.x;
                this.y = attrs.y;
                this.radius = attrs.radius;
                this.name = attrs.name;
                this.vx = attrs.vx;
                this.vy = attrs.vy;
                this.dx = attrs.dx;
                this.dy = attrs.dy;
                this.context = attrs.context;
                this.target = {x:0,y:0};
                this.drawit = function() {
                    // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
                    this.context.beginPath();
                    this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
                    //createRadialGradient(x0, y0, r0, x1, y1, r1);
                    var radialGradient = this.context.createRadialGradient(this.x+2, this.y+2, BALL_RADIUS, this.x+2, this.y+2, 1);
                    radialGradient.addColorStop(1,'#fff' );
                    radialGradient.addColorStop(0, this.color);
                    this.context.fillStyle = radialGradient;
                    this.context.fill();
                    this.context.closePath();
                };
                this.drawit(this.context);
            };

            var Tri = function(attrs){
                this.context = $scope.context;
                this.vert1   = attrs.vert1;
                this.vert2   = attrs.vert2;
                this.vert3   = attrs.vert3;
                this.drawit  = function() {
                    this.context.beginPath();
                    this.context.moveTo(this.vert1[0],this.vert1[1]);
                    this.context.lineTo(this.vert2[0],this.vert2[1]);
                    this.context.lineTo(this.vert3[0],this.vert3[1]);
                    this.context.fill();
                };
                this.init = function(){
                    this.xmax = _.max( [ this.vert1[0], this.vert2[0], this.vert3[0] ] );
                    this.xmin = _.min( [ this.vert1[0], this.vert2[0], this.vert3[0] ] );
                    this.ymax = _.max( [ this.vert1[1], this.vert2[1], this.vert3[1] ] );
                    this.ymin = _.min( [ this.vert1[1], this.vert2[1], this.vert3[1] ] );
                    this.drawit();
                };
                this.init();
            };

            $scope.init();
    });
})(window);