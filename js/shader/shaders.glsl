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

bool intPlane( vec3 p_n, vec3 r_d, vec3 r_o, out float t )
{
    //depth of the plane
    float d = 1.15;
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
    normal.x = (normal.x-0.5)*2.;
    normal.y = (normal.y-0.5)*2.;

    //a pixel of the normal map
    vec3 pixel = vec3(c,1.5);

    //half of the sprite, and 1.5 units 'out' of the screen
    vec3 ray_origin = vec3(0.5,0.5,-1.5);

    //the direction is decided by the current 'pixel' minus the defined origin
    vec3 ray_direction = pixel-ray_origin;
    
    //refracts the ray with an IOR of 1.15
    vec3 refract = refract(ray_direction, normalize(normal.xyz), 1.0/1.15);
 
    //normal vector for the plane of the chicken
    vec3 p_n = vec3(0.,0.,-1.);

    float t;
    //checks for intersection with plane, sets t = intersection distance
    bool result = intPlane(p_n, refract, pixel, t);
    vec3 pos = (vec3(c.x,c.y-0.1, 0.)+normalize(refract.xyz)/resolution.x*t)-vec3((floor(distance)+0.5)/resolution.xy, 0.);
    if(result && pos.x<1.&&pos.x>0.
                && pos.y<1. && pos.y>0.){
        vec4 col = texture2D(iChannel1, (pos.xy));
        col*=normal.w;
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
---d

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