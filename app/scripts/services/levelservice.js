/**
 * Created by Oakley Hall on 8/26/14.
 */
(function (ns) {
    'use strict';
    ns.app.factory('LevelService', function () {

            var blockheight=50,
                blockwidth=50;

            var rects = [
            {
                x: 20,
                y: 20,
                width: blockwidth,
                height: blockheight
            },
            {
                x: 140,
                y: 20,
                width: blockwidth,
                height: blockheight
            },
            {
                x: 240,
                y: 40,
                width: blockwidth,
                height: blockheight
            },
            {
                x: 340,
                y: 20,
                width: blockwidth,
                height: blockheight
            },
            {
                x: 120,
                y: 220,
                width: blockwidth,
                height: blockheight
            },
            {
                x: 140,
                y: 220,
                width: blockwidth,
                height: blockheight
            }];

            return{
               rectangles:function(){
                    return rects;
               }
            };
        });
})(window);