---
name: Lava
type: fragment
author: Kyle Falicov,
uniform.scroll: { "type": "2f", "value": {"x": 0, "y": 0} }
---
// Perlin By Morgan McGuire @morgan3d, http://graphicscodex.com
// Voronoi by Tomasz Dobrowolski' 2016,
// Based on https://www.shadertoy.com/view/ldl3W8 by Inigo Quilez
// with hash functions from Dave Hoskins

precision mediump float;

uniform vec2 scroll;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D iChannel0;
varying vec2 fragCoord;

#define NOISE fbm
#define NUM_NOISE_OCTAVES 5
#define ANIMATE
#define EPSILON .0001

// How far cells can go off center during animation (must be <= .5)
#define ANIMATE_D 0.2

// Precision-adjusted variations of https://www.shadertoy.com/view/4djSRW
float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.13); 
    p3 += dot(p3, p3.yzx + 3.333); 
    return fract((p3.x + p3.y) * p3.z); 
}


float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    // Simple 2D lerp using smoothstep envelope between the values.
	// return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
	//			mix(c, d, smoothstep(0.0, 1.0, f.x)),
	//			smoothstep(0.0, 1.0, f.y)));

	// Same code, with the clamps in smoothstep and common subexpressions
	// optimized away.
    vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
		v += a * noise(x);
		x =  rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    vec2 o = fract((p3.xx+p3.yz)*p3.zy);
    #ifdef ANIMATE
        o = 0.5 + ANIMATE_D*sin( time*0.6 + 6.2831*o );
    #endif
    return o;
}

vec2 voronoi( in vec2 uv )
{
    vec2 n = floor(uv);
    vec2 f = fract(uv);

    //----------------------------------
    // first pass: regular voronoi
    //----------------------------------
	vec2 mr;

    float md = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2 g = vec2(float(i),float(j));
		vec2 o = hash22( n + g );
        vec2 r = g + o - f;
        float d = dot(r,r);

        if( d<md )
        {
            md = d;
            mr = r;
        }
    }

    //----------------------------------
    // second pass: distance to borders
    //----------------------------------
    md = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2 g = vec2(float(i),float(j));
		vec2 o = hash22( n + g );
        vec2 r = g + o - f;

        if( dot(mr-r,mr-r)>EPSILON )
        md = min( md, dot( 0.5*(mr+r), normalize(r-mr) ) );
    }

    return vec2( md+NOISE(uv), mr );
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main( void ) {
	vec2 v = vec2(0.0);
    vec2 coord = (fragCoord.xy+(scroll)) * vec2(0.01, 0.06);//- vec2(time * 1.4, resolution.y / 2.0 );
    vec2 coord2 = (fragCoord.xy+(scroll)) * vec2(0.03, 0.06);// - vec2(time * 0.1, time * 0.013);

    coord+=vec2(-(time*0.13),
    // 0
    0.5*(
    sin(2.*coord.x)
        //-2.*(sin(1.*coord.x)*sin(2.*coord.y-9.2))
        )
    );
    coord=rotate(coord,1.131);

    v = voronoi(coord);

	float fac = v.x+NOISE(coord)-0.6;
	//v=v<0.7?1.:0.;
	vec4 yellow = vec4( 1., 0.827, 0.251, 1.0);     //FFD340
	vec4 orange = vec4(1., 0.416, 0.239, 1.0);      //FF6A3D
	vec4 red = vec4(0.788, 0.169, 0.125, 1.0);      //C92B20
	vec4 brown = vec4(0.361, 0.125, 0.094, 1.0);    //5C2018

	vec4 col = mix( yellow, mix( orange, mix( red, brown, 
        step(0.8,fac) ),  
        step(0.7,fac) ),  
        step(0.48,fac) ) ;

    gl_FragColor = vec4(fac);
    gl_FragColor = col;
}