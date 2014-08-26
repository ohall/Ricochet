'use strict';

angular.module('RicochetApp')
  .controller('MainCtrl', function ($scope, $interval) {
        var BALL_RADIUS = 5,
            UPDATE_INTERVAL = 1000/60,
            bounceFactor = 0.1;


        $scope.init = function(){
            $scope.canvas = document.getElementById( 'gameCanvas' );
            $scope.canvas.width =  350;
            $scope.canvas.height = 700;
            $scope.gamemode = 'game';
            $scope.running = false;

            $scope.context = $scope.canvas.getContext('2d');
            var attrs = {
                color:'blue',
                name:'hero',
                x:$scope.canvas.width/2,
                y:$scope.canvas.height/2,
                radius:BALL_RADIUS,
                vx:300,
                vy:300,
                dx:10,
                dy:10,
                context:$scope.context
            };
            $scope.ball = new Ball(attrs);
        };

        $scope.drawFunc = function(ctx) {
            if(ctx){
                // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
                //createRadialGradient(x0, y0, r0, x1, y1, r1);
                var radialGradient = ctx.createRadialGradient(this.x+2, this.y+2, BALL_RADIUS, this.x+2, this.y+2, 1);
                radialGradient.addColorStop(1,'#fff' );
                radialGradient.addColorStop(0, this.color);
                ctx.fillStyle = radialGradient;
                ctx.fill();
                ctx.closePath();
            }
        };

        $scope.down = function(event){
            if(!$scope.running) {
                $scope.context.beginPath();
                $scope.context.moveTo($scope.ball.x, $scope.ball.y);
                $scope.context.lineTo(event.offsetX, event.offsetY);
                $scope.line = $scope.context.stroke();
            }
        };

        $scope.up = function(event){
            if(!$scope.running) {
                $scope.line = null;
                aimAtTarget($scope.ball,event.offsetX,event.offsetY);
                $scope.start();
            }
        };

        $scope.win = function(){
            $scope.stop();
            $scope.gamemode = 'win';
            $interval( $scope.reset, 1000, 1);
        };

        $scope.reset = function(){
            $scope.init();
        };

        var aimAtTarget = function(ball,targetx,targety){
            ball.target = {x:targetx,y:targety};
            ball.dx = (targetx - ball.x)*( bounceFactor);
            ball.dy = (targety - ball.y)*(-bounceFactor);
        };

        var clearCanvas = function(ctx) {
            if(ctx){ ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height); }
        };

        var update = function() {
            clearCanvas($scope.context);
            if($scope.ball){
                var contact = wallContact($scope.ball,$scope.canvas );

                if(contact.top){
                    $scope.win();
                    return;
                }

                if( contact.left || contact.right ){
                    $scope.ball.vx *= -bounceFactor;
                    $scope.ball.dx=-$scope.ball.dx;
                }
                if( contact.bottom ){
                    $scope.ball.vy *= -bounceFactor;
                    $scope.ball.dy=-$scope.ball.dy;
                }
                $scope.ball.x+=$scope.ball.dx;
                $scope.ball.y-=$scope.ball.dy;
                $scope.ball.drawit();
            }
        };

        $scope.stop = function(){
            $interval.cancel( $scope.updates );
            $scope.running = false;
        };

        $scope.start = function(){
            $scope.updates = $interval(update, UPDATE_INTERVAL);
            $scope.running = true;
        };

        /**
         * Utils
         */
        var getBallatEdgeCoord = function(ballRadius,edgeLoc){
            return( edgeLoc === 0 )?ballRadius:(edgeLoc - ballRadius);
        };

        var wallContact = function(ball, canvas){
            var contact = {
                top:false,
                right:false,
                bottom:false,
                left:false
            };
            if( ball.y <= getBallatEdgeCoord(BALL_RADIUS, 0 ) ){
                contact.top = true;
            }
            if( ball.y >= getBallatEdgeCoord(BALL_RADIUS,canvas.height)){
                contact.bottom = true;
            }
            if( ball.x <= getBallatEdgeCoord(BALL_RADIUS,0)){
                contact.left = true;
            }
            if( ball.x >= getBallatEdgeCoord(BALL_RADIUS,canvas.width)){
                contact.right = true;
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
            this.vy = attrs.vx;
            this.dx = attrs.dx;
            this.dy = attrs.dy;
            this.context = attrs.context;
            this.draw = $scope.drawFunc;
            this.target = {x:0,y:0};
            this.drawit = function(){
                this.draw(this.context);
            };
            this.drawit();
        };
        $scope.init();
});
