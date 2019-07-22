
precision mediump float;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

attribute vec2 inPosition;
attribute vec2 inTexCoord;

varying vec2 outTexCoord;
varying vec2 outPosition;

void main () 
{
    outTexCoord = inTexCoord;
    outPosition = inPosition;

    //gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(inPosition, 1.0, 1.0);
    float ratiox=(320.+160.)/320.;
    float ratioy=(240.+160.)/240.;
    vec4 p = uProjectionMatrix * vec4(inPosition.x*ratiox*2., inPosition.y*ratioy*2.,1.0,1.0);
    gl_Position = p;
}