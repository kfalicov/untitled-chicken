precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D iChannel0;
const float offset = 1.0/64.0;
const vec4 beak = vec4(1.0 ,112./255., 51./255.,1.0);
const vec4 beak2 = vec4(199./255.,60./255., 0., 1.0);
varying vec2 fragCoord;
void main( void ) {

    vec2 p = (floor(fragCoord.xy)-0.5) / resolution.xy;
    p.y=1.-p.y;

    vec4 col = texture2D(iChannel0, p);
    float a = texture2D(iChannel0, vec2(p.x + offset, p.y)).a +
			texture2D(iChannel0, vec2(p.x, p.y - offset)).a +
			texture2D(iChannel0, vec2(p.x - offset, p.y)).a +
			texture2D(iChannel0, vec2(p.x, p.y + offset)).a;
    bool result = (col == vec4(0.0,0.0,0.0,1.0))||(col==beak)||(col==beak2);
	float val= result||(a <4.0 && col.w>0.0)? 1.0 : 0.0;
			gl_FragColor = vec4(val, val, val, val);

    //vec4 texColor = texture2D(iChannel0, p);
    //gl_FragColor = texColor;
}