precision mediump float;

uniform vec2 resolution;
uniform float time;


uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
void main()
{
    vec2 uv = outTexCoord;
    vec2 p = (3.0 * gl_FragCoord.xy - resolution) / max(resolution.x, resolution.y);

    for (int i = 1; i < 5; i++)
    {
        vec2 newp = p + sin(time * 0.2)*cos(time*0.32);
        newp.x += 0.6 / float(i) * sin(float(i) * p.y + time / 0.9 + 0.3 * float(i)) + 0.5;
        newp.y += 0.6 / float(i) * sin(float(i) * p.x + time / 1.2 + 0.3 * float(i + 10)) - 0.5;
        p = newp;
    }

    float ratiox=(320.+160.)/320.;
    float ratioy=(240.+160.)/240.;

    uv.x=(uv.x*ratiox)-(40./320.);
    uv.y=(uv.y*ratioy)-(40./240.);
    vec4 texColor = vec4(0.,0.,0.,0.);
    vec3 col = vec3(0.8 * sin(3.0 * p.x) + 0.8, 0.8 * sin(3.0 * p.y) + 0.8, 0.8 * sin(p.x + p.y) + 0.8);
    vec3 tempcol = vec3(0.,0.,0.);
    if(uv.x>0.&& uv.x<1.&&uv.y>0.&&uv.y<1.){
        texColor = texture2D(uMainSampler, uv);
        tempcol.x=(col.z*col.x*0.8)/2./+(col.x*.9) - ((col.x*col.y*0.2)/4.+col.z/9.);
        tempcol.y=(col.x+col.z+col.y)*0.9;
        tempcol.z=(col.x*col.y*0.8)/2.+col.z/2.;
    }
    tempcol = normalize(tempcol);
    tempcol*=0.8;
    texColor.x =min(((texColor.x*2. + tempcol.x*1.5)/2.), tempcol.x);
    texColor.y =min(((texColor.y*0.5 + tempcol.y*0.2)/4.), texColor.y*0.25);
    texColor.z =min(((texColor.z*0.5 + tempcol.z*0.8)/1.1), texColor.z*0.9);
    gl_FragColor = texColor;
}