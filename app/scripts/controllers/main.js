(function (ns) {
    'use strict';

    ns.app.controller('MainCtrl', function ($scope, $interval, $timeout, LevelService, $window) {
        var BALL_RADIUS = 5,
            UPDATE_INTERVAL = 1000 / 60,
            GAME_TIMEOUT = 2000,
            bounceFactor = 0.1;

        //////////////////////////////////////////
        /// Game Behavior
        //////////////////////////////////////////

        $scope.init = function () {
                $scope.canvas = document.getElementById('gameCanvas');
                $scope.context = $scope.canvas.getContext('2d');
                $scope.resetGame();
        };

        $scope.setupCanvasAndBall = function () {
                $scope.setCanvasSize();
                var ballAttrs = {
                    color: 'blue', name: 'hero',
                    x: $scope.width / 2, y: $scope.height / 2,
                    radius: BALL_RADIUS,
                    vx: 30, vy: 30, dx: 1, dy: 1,
                    context: $scope.context
                };

                $scope.ball = new Ball(ballAttrs);
        };

        $scope.resetGame = function () {
            $scope.tris = [];
            $scope.rects = [];
            $scope.gamemode = 'game';
            $scope.running = false;
            $scope.setupCanvasAndBall();
        };

        $scope.stop = function () {
            $interval.cancel($scope.updates);
            $interval.cancel($scope.gametimer);
            $scope.running = false;
        };

        $scope.start = function () {
            $scope.updates = $interval($scope.update, UPDATE_INTERVAL);
            $scope.gametimer = $interval( function(){ $scope.levelOver(false) }, GAME_TIMEOUT, 1);
            $scope.running = true;
        };

        $scope.levelOver = function (isWon) {
            $scope.stop();
            $scope.gamemode = isWon?'win':'lose';
            $interval($scope.resetGame, 500, 1);
        };



        //////////////////////////////////////////
        /// User Controla
        //////////////////////////////////////////

        $scope.mousedown = function (event) {
            if (!$scope.running) {
                $scope.context.beginPath();
                $scope.context.moveTo($scope.ball.x, $scope.ball.y);
                $scope.context.lineTo(event.offsetX, event.offsetY);
                $scope.line = $scope.context.stroke();
            }
        };

        $scope.mouseup = function (event) {
            if (!$scope.running) {
                $scope.line = null;
                $scope.aimAtTarget($scope.ball, event.offsetX, event.offsetY);
                $scope.start();
            }
        };

        $scope.aimAtTarget = function (ball, targetx, targety) {
            ball.target = {x: targetx, y: targety};
            ball.dx = Math.round( (targetx - ball.x) * ( bounceFactor) );
            ball.dy = Math.round( (targety - ball.y) * (-bounceFactor) );
        };

        $scope.clearCanvas = function (ctx) {
            if (ctx) { ctx.clearRect(0, 0, $scope.width, $scope.height); }
        };

        $scope.update = function () {
            $scope.clearCanvas($scope.context);
            $scope.drawRects();
            $scope.drawball();
        };

        $scope.drawball = function () {
            if ($scope.ball) {
                var contact = $scope.collision($scope.ball, $scope.canvas, $scope.rects);

                if (contact.exit) {
                    $scope.levelOver(true);
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
                $scope.ball.x += Math.round($scope.ball.dx);
                $scope.ball.y -= Math.round($scope.ball.dy);
                $scope.ball.drawit();
            }
        };

        $scope.drawRects = function () {
            if ($scope.rects.length > 0) {
                _.each($scope.rects,function(rect){
                    rect.drawit();
                });
            }else{
                _.forEach(LevelService.rectangles(),function(atr){
                    $scope.rects.push( new Rect(atr) );
                });
                $scope.drawRects();
            }
        };


        //////////////////////////////////////////
        /// Utils
        //////////////////////////////////////////
        $scope.getBallatEdgeCoord = function (ballRadius, edgeLoc) {
            return( edgeLoc === 0 ) ? ballRadius : (edgeLoc - ballRadius);
        };

        $scope.collision = function (ball, canvas, obstacles) {
            var contact = { top: false, right: false, bottom: false, left: false, exit:false };

            if (ball.y <= $scope.getBallatEdgeCoord(BALL_RADIUS, 0)) {
                contact.exit = true;
            }
            if (ball.y >= $scope.getBallatEdgeCoord(BALL_RADIUS, canvas.height)) {
                contact.bottom = true;
            }
            if (ball.x <= $scope.getBallatEdgeCoord(BALL_RADIUS, 0)) {
                contact.left = true;
            }
            if (ball.x >= $scope.getBallatEdgeCoord(BALL_RADIUS, canvas.width)) {
                contact.right = true;
            }

            _.each(obstacles,function(ob){
                if ( ball.y >= ob.ymax && ball.y <= ob.ymin && ball.x <= ob.xmax && ball.x >= ob.xmin ) {

                    //get balls distance from edge of obstacle
                    var closest = canvas.height*canvas.width,
                        left    = Math.abs(ball.x - ob.xmin),
                        right   = Math.abs(ball.x - ob.xmax),
                        top     = Math.abs(ball.y - ob.ymax),
                        bottom  = Math.abs(ball.y - ob.ymin),
                        distances = [left,right,top,bottom];

                    //find which one is closest
                    _.each(distances,function(side){
                       if(side<closest){
                           closest = side;
                       }
                    });

                    //set the closest one as true
                    switch(closest){
                        case left:   contact.left    = true; break;
                        case right:  contact.right   = true; break;
                        case top:    contact.top     = true; break;
                        case bottom: contact.bottom  = true; break;
                        default:     contact.bottom  = true;
                    }
                    return false;
                }
            });
            return contact;
        };

        $($window).resize( function(){
           $scope.init();
        });

        $scope.setCanvasSize = function () {
            $scope.width = $window.innerWidth;
            $scope.height = $window.innerHeight;
            $timeout($scope.update);
        };

        //////////////////////////////////////////
        /// Classes
        //////////////////////////////////////////
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

        var Rect = function(attrs){
            this.context    = $scope.context;
            this.x          = attrs.x;
            this.y          = attrs.y;
            this.width      = attrs.width;
            this.height     = attrs.height;
            this.drawit  = function() {
                this.context.beginPath();
                this.context.rect(this.x,this.y,this.width,this.height);
                this.context.closePath();
                this.context.strokeStyle = 'blue';
                this.context.stroke();
                this.context.fillStyle = 'blue';
                this.context.fill();
            };
            this.init = function(){
                this.xmax = this.x + this.width + 5;
                this.xmin = this.x - 5;
                this.ymax = this.y - 5;
                this.ymin = this.y + this.width + 5;
                this.drawit();
            };
            this.init();
        };

        $scope.init();
    });
})(window);