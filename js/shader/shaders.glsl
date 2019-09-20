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