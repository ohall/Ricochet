/**
 * Created by Oakley Hall on 8/26/14.
 */
(function (ns) {
    'use strict';
    ns.app.factory('LevelService', function () {
//            var tris = [
//            {   vert1: [100, 75],
//                vert2: [100, 25],
//                vert3: [75, 50] },
//
//            {   vert1: [200, 175],
//                vert2: [200, 125],
//                vert3: [175, 150] }
//            ];


            var rects = [
            {
                x: 20,
                y: 20,
                width: 20,
                height: 20
            },
            {
                x: 140,
                y: 20,
                width: 20,
                height: 20
            },
            {
                x: 240,
                y: 40,
                width: 20,
                height: 20
            },
            {
                x: 340,
                y: 20,
                width: 20,
                height: 20
            },
            {
                x: 120,
                y: 220,
                width: 20,
                height: 20
            },
            {
                x: 140,
                y: 220,
                width: 20,
                height: 20
            }
            ];




            return{
//                triangles:function(){
//                    return tris;
//               },
               rectangles:function(){
                    return rects;
               }
            };
        });
})(window);