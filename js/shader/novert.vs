
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
    vec4 p = uProjectionMatrix * vec4(inPosition,1.0,1.0);
    gl_Position = p;
}