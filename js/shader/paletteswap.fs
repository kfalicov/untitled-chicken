precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform float     intensity;
uniform sampler2D uMainSampler;
varying vec2 fragCoord;
void main( void ) {
    vec2 uv = ((floor(fragCoord.xy)+0.5) / resolution.xy);
    vec4 texColor = texture2D(uMainSampler, uv);
    if(texColor.w>0.5){
        texColor.r=0.5;
    }
    gl_FragColor = texColor;
}