precision mediump float;
uniform float     time;
uniform sampler2D uMainSampler;
void main( void ) {
    vec2 uv = gl_FragCoord.xy;
    //uv.y *= -1.0;
    //uv.x += (sin((uv.y + (time * 0.0005)) * 20.0) * 0.008) + (sin((uv.y + (time * 0.002)) * 32.0) * 0.002);
    uv.y += (sin((uv.x + (time * 0.0004)) * 12.0) * 0.005) + (sin((uv.x - (time * 0.001)) * 50.0) * 0.004);
    vec4 texColor = texture2D(uMainSampler, uv);
    gl_FragColor = texColor;
}