/**
 * Created by Oakley Hall on 8/26/14.
 */
(function (ns) {
    'use strict';
    ns.app.factory('LevelService', function () {
            var tris = [];
            tris.push({
                vert1: [100, 75],
                vert2: [100, 25],
                vert3: [75, 50]
            });

            return{
                triangles:function(){
                    return tris;
               }
            };
        });
})(window);