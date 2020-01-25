---
name: Crystal
type: fragment
author: Kyle Falicov
uniform.distance: { "type": "2f", "value": {"x": 0, "y": 0} }
---

precision mediump float;
uniform vec2 resolution;
uniform vec2 distance;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
varying vec2 fragCoord;

bool intPlane( vec3 p_n, vec3 r_d, vec3 r_o, float d, out float t )
{
    float denom = dot(r_d, p_n);
    if(abs(denom)>0.0001){
        t = (d-dot(r_o, p_n))/denom;
        return (t>=0.0001);
    }
    return false;
}

void main( void ) {

    //convert pixel resolution into [0,1]
    vec2 c = (floor(fragCoord.xy)+0.5) / resolution.xy;
    //flip Y
    c.y = 1.-c.y;
    vec4 normal = texture2D(iChannel0, c);
    normal.x = (0.5-normal.x)*2.;
    normal.y = (normal.y-0.5)*2.;

    //a pixel of the normal map
    vec3 ray_origin = vec3((c-0.5)*4.,-1.45);

    //the direction is decided by the current 'pixel' minus the defined origin
    vec3 ray_direction = vec3(0.0,0.5,0.)-ray_origin;
    
    //refracts the ray with an IOR of 1.15
    vec3 refract = refract(normalize(ray_direction), normalize(normal.xyz), 1./1.15);
    //refract=normalize(refract);
 
    //normal vector for the plane of the chicken
    float p_d = 4.;
    vec3 p_n = vec3(0.,0.,-1.);

    float t;
    //checks for intersection with plane, sets t = intersection distance
    bool result = intPlane(p_n, refract, ray_origin, p_d, t);
    vec3 pos = (vec3(1.-c.x, c.y-refract.y/t*1.1-0.15, 0.)+refract.xyz/resolution.x*t)-vec3((floor(vec2(distance.x, distance.y))+0.5)/resolution.xy, 0.);
    //pos.x+=1.;
    if(result && pos.x<1.&&pos.x>0.
                && pos.y<1. && pos.y>0.){
        vec4 col = texture2D(iChannel1, (pos.xy));
        col*=normal.w*0.5;
        //refract.w=1.;
        gl_FragColor=col;
        //return;
    }
}

---
name: Stripes
type: fragment
author: Richard Davey
uniform.size: { "type": "1f", "value": 16.0 }
---

precision mediump float;

uniform float size;
uniform vec2 resolution;

varying vec2 fragCoord;

void main(void)
{
    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 white = vec3(1.0, 1.0, 1.0);
    bool color = (mod((fragCoord.y / resolution.y) * size, 1.0) > 0.5);

    if (!color)
    {
        gl_FragColor = vec4(white, 1.0);
    }
}

---
name: Palette
type: fragment
author: Kyle Falicov
uniform.color: { "type": "3f", "value": {"x": 0, "y": 0, "z": 0} }
---

precision mediump float;
uniform vec2 resolution;
uniform vec3 color;
uniform sampler2D iChannel0;
varying vec2 fragCoord;

void main( void ) {

    //convert pixel resolution into [0,1]
    vec2 c = (floor(fragCoord.xy)+0.5) / resolution.xy;
    //flip Y
    //c.y = 1.-c.y;
    vec4 col = texture2D(iChannel0, c);

    vec3 identity = vec3(1.,1.,1.);

    float total = dot(col.xyz, identity);

    vec3 shadow = color-normalize(color)*color*color;

    if(total > 2.99){
        gl_FragColor = vec4(color, 1.);
    }else if(total>2.39){
        gl_FragColor = vec4(color-abs(shadow)/2., 1.);
    }else{
        gl_FragColor = col;
    }
}

---
name: Cloth
type: fragment
author: Kyle Falicov
---

precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D iChannel0;
varying vec2 fragCoord;

void main( void ) {
    vec2 p = (floor(fragCoord.xy)-0.5) / resolution.xy;
    
    //p.x += (sin((p.y*40.)+8.*time)*0.02)+(sin((p.y*75.)+16.*time)*0.03);
    p.y = 1.-p.y;
    float howFarDown = p.y/1.;
    float howFarSides = 1.-(abs(0.5-p.x)/0.5);
    float xWave = sin((p.y*11.)+1.5*time)*0.09;
    float xWave2 = sin((p.x*1.8)+1.9*time)*0.02;
    float xWave3 = sin((p.y*40.)+3.5*time)*0.04;
    p.x += (xWave+xWave2+(xWave3*howFarSides))*howFarDown;
    float yWave = sin((p.x*7.)+.9*time)*0.05;
    float yWave2 = sin((p.x*20.)+4.*-time)*0.01;
    float spikes = (abs(cos((p.x*10.)+2.*-time))-0.5)*0.09;
    p.y += (yWave+yWave2+spikes)*howFarDown*howFarSides;
    //p.y += (((sin((p.x*7.)+.5*time))*0.05)+((sin((p.x*20.)-4.*time))*0.01)+(((abs(cos((p.x*10.)+2.*-time))-0.5))*0.09))*(p.y/1.);
    vec4 texColor = texture2D(iChannel0, p);
    texColor.a = texColor.a>0.5? 1.: 0.;
    gl_FragColor = texColor;
}

---
name: Glitch
type: fragment
author: Kyle Falicov
---

precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D iChannel0;
varying vec2 fragCoord;

void main( void ) {
    vec2 p = (floor(fragCoord.xy)-0.5) / resolution.xy;
    
    //p.x += (sin((p.y*40.)+8.*time)*0.02)+(sin((p.y*75.)+16.*time)*0.03);
    p.y = 1.-p.y;
    p.x+=sin((p.y*11.))*0.1;
    vec4 texColor = texture2D(iChannel0, p);
    texColor.a = texColor.a>0.5? 1.: 0.;
    gl_FragColor = texColor;
}

---
name: Fire
type: fragment
author: Kyle Falicov/Jeremy Mitchell
uniform.angle: { "type": "1f", "value": -90 }
---

precision mediump float;
varying vec2 fragCoord;
uniform float     time;
uniform vec2      resolution;
uniform float angle;

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
    float ang = angle*(3.14159/180.);

	vec2 uv = (floor(fragCoord.xy)-0.5) / resolution.xy;
    //uv = (rotation*vec4(uv, 0.,0.)).xy;
    float fracX = 32./resolution.x;
    float fracY = 32./resolution.y;
    
    mat2 rotation = mat2(vec2(cos(ang), -sin(ang)),
                         vec2(sin(ang), cos(ang)));

    vec2 direction = rotation*uv.yx;

    //two scrolling voronoi maps. Could be a texture also
    //voronoi 1 moves with vec2(0.,-time * 3.5)
    //voronoi 2 moves with vec2(42.,-time * 1.1)
    float up0 = voronoi2D(direction * vec2(6.0/fracX, 6.0/fracY) + vec2(0.,-time * 3.5)  );
	float up1 = 0.25 + voronoi2D(direction * vec2(8.0/fracX, 8.0/fracY) + vec2(42.,-time * 1.4) + 30.0 );
	//float finalMask = up0 * up1 + (1.0-uv.y);
	float finalMask = up0 * up1;
    //finalMask += 1.-length(falloff);
    
    //vertical gradient. In a game use vertex color or something.
    //finalMask += (3.0-uv.y)* 0.25;
    finalMask += 0.5-(direction-(rotation*vec2(0.5,0.5))).y;
    
    //horizontal gradient.
    //finalMask *= 0.6-abs(uv.x - 0.5);
    finalMask *= 1.0-abs((direction-(rotation*vec2(0.5,0.5))).x*2.5);
    
    vec4 dark = mix( vec4(0.0), vec4( 1.0, 0.4, 0.0, 0.9),  step(0.8,finalMask) ) ;
    vec4 light = mix( dark, vec4( 1.0, 0.8, 0.0, 0.9),  step(0.95, finalMask) ) ;
    
    
	gl_FragColor = light;
    
    //gl_FragColor = vec4(finalMask);
}
