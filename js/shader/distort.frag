precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform float     intensity;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
void main( void ) {
    vec2 uv = outTexCoord;
    
    float ratiox=(320.+160.)/320.;
    float ratioy=(240.+160.)/240.;
    //uv.y *= -1.0;
    uv.x += ((sin((uv.y + (time * 0.0005)) * 10.0) * 0.008) + (sin((uv.y + (time * 0.002)) * 32.0) * 0.005))*intensity;
    uv.y += ((sin((uv.x + (time * 0.0004)) * 12.0) * 0.005) + (sin((uv.x - (time * 0.001)) * 50.0) * 0.004))*intensity;
    uv.x=(uv.x*ratiox)-(40./320.);
    uv.y=(uv.y*ratioy)-(40./240.);
    vec4 texColor = texture2D(uMainSampler, uv);
    if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.){
        texColor = vec4(0.,0.,0.,0.);
    }
    gl_FragColor = texColor;
}