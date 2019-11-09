---
name: Fire
type: fragment
author: Jeremy Mitchell
---

precision mediump float;
varying vec2 fragCoord;
uniform float     time;
uniform vec2      resolution;

float hash2D(vec2 x) {
	return fract(sin(dot(x, vec2(13.454, 7.405)))*12.3043);
}

//voronoi borrowed from someone. Probably iq? Sorry I forgot :(

float voronoi2D(vec2 uv) {
    vec2 fl = floor(uv);
    vec2 fr = fract(uv);
    float res = 1.0;
    for( int j=-1; j<=1; j++ ) {
        for( int i=-1; i<=1; i++ ) {
            vec2 p = vec2(i, j);
            float h = hash2D(fl+p);
            vec2 vp = p-fr+h;
            float d = dot(vp, vp);
            
            res +=1.0/pow(d, 8.0);
        }
    }
    return pow( 1.0/res, 1.0/16.0 );
}

void main( void )
{
	vec2 uv = (floor(fragCoord.xy)-0.5) / resolution.xy;


    //two scrolling voronoi maps. Could be a texture also
    float up0 = voronoi2D(uv * vec2(6.0, 6.0) + vec2(0.,-time * 3.5)  );
	float up1 = 0.5 + voronoi2D(uv * vec2(8.0, 8.0) + vec2(42.,-time * 1.1) + 30.0 );
	float finalMask = up0 * up1 + (1.0-uv.y);
   
    
    //vertical gradient. In a game use vertex color or something.
    finalMask += (3.0-uv.y)* 0.25;
    
    //horizontal gradient.
    finalMask *= 0.6-abs(uv.x - 0.5);
    
    vec4 dark = mix( vec4(0.0), vec4( 1.0, 0.4, 0.0, 0.9),  step(0.8,finalMask) ) ;
    vec4 light = mix( dark, vec4( 1.0, 0.8, 0.0, 0.9),  step(0.95, finalMask) ) ;
    
    
	gl_FragColor = light;
    
    //gl_FragColor = vec4(finalMask);
}