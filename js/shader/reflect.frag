precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D iChannel0;
varying vec2 fragCoord;
void main( void ) {

    vec2 p = (floor(fragCoord.xy)+vec2(0.5,0.5)) / resolution.xy;
    
    p.x += (sin((p.y*40.)+8.*time)*0.02)+(sin((p.y*75.)+16.*time)*0.03);
    vec4 texColor = texture2D(iChannel0, p);
    gl_FragColor = texColor;
    gl_FragColor.rgba *= 0.2;
}