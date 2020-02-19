---
name: Water
type: fragment
author: Kyle Falicov (with perlin from Morgan McGuire @morgan3d),

uniform.scroll: { "type": "2f", "value": {"x": 0, "y": 0} }
uniform.zoom: { "type": "1f", "value": 1.0 }
---
// By Morgan McGuire @morgan3d, http://graphicscodex.com
// Reuse permitted under the BSD license.

// All noise functions are designed for values on integer scale.
// They are tuned to avoid visible periodicity for both positive and
// negative coordinates within a few orders of magnitude.

// For a single octave
//#define NOISE noise

// For multiple octaves

precision mediump float;

uniform vec2 scroll;
uniform float zoom;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D iChannel0;
varying vec2 fragCoord;

#define NOISE fbm
#define NUM_NOISE_OCTAVES 3
#define ANIMATE
#define EPSILON .0001

// How far cells can go off center during animation (must be <= .5)
#define ANIMATE_D .2

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

//smoothmin function by iq
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

vec2 voronoi( in vec2 uvw )
{
    vec2 n = floor(uvw.xy);
    vec2 f = fract(uvw.xy);

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
        md = smin( md, dot( 0.5*(mr+r), normalize(r-mr) ), 0.1 );
    }

    return vec2( md, mr );
}

// Precision-adjusted variations of https://www.shadertoy.com/view/4djSRW
float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }

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
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

void main( void ) {
	vec2 v = vec2(0.0);
    
	vec2 offset = (resolution/2.-fragCoord)/zoom-scroll;
    
    vec2 coord = floor(offset) * vec2(0.01, 0.02);
    float waves = 0.25*sin(coord.x+time)*sin(coord.y*1.3+time);
    coord.y+=waves;
    coord.x+=0.7*fbm(coord*1.5+time*0.04);
    coord.y+=0.6*fbm(coord*1.5+vec2(9.2,3.3)+time*0.1);
    coord.x+=time*0.06;

    v = voronoi(coord);
    vec2 v2 = voronoi(coord+vec2(19.4,12.52));

	float fac = v.x;
	//v=v<0.7?1.:0.;
	vec4 white = vec4( 1., 1., 1., 1.0);
	vec4 blue_2 = vec4(0.686, 0.737, 0.929, 1.0);
	vec4 blue_1 = vec4(0.384, 0.455, 0.741, 1.0);
	vec4 blue_0 = vec4(0.141, 0.22, 0.549, 1.0);

	vec4 col = mix( blue_0, blue_1, step(0.05,fac) ) ;
	vec4 col2 = mix( blue_2, col,  step(0.02,v2.x) ) ;
	// vec4 col3 = mix( white, col2,  step(0.01,v2.x) ) ;

	// vec4 col = mix( red, blue, step(0.01,fac) ) ;
	// vec4 col2 = mix( orange, col,  step(0.01,fac) ) ;
	// vec4 col3 = mix( yellow, col2,  step(0.01,fac) ) ;

    // col2.xyz*=0.25*waves+0.75;

    gl_FragColor = vec4(fac);
    gl_FragColor = col2;
}