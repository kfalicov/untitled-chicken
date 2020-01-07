export class GrayscalePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game)
    {
        super({
            game: game,
            renderer: game.renderer,
            fragShader:`
                precision mediump float;
                uniform sampler2D uMainSampler;
                varying vec2 outTexCoord;
                void main(void) {
                vec4 color = texture2D(uMainSampler, outTexCoord);
                float gray = dot(color.rgb, vec3(0.499, 0.787, 0.114));
                gl_FragColor = vec4(vec3(gray), 1.0);
                }`
        });
    } 
}

export class DistortPipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game)
    {
        super({
            game: game,
            renderer: game.renderer,
            vertShader:`
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
            `,
            fragShader:`
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
                }`
        });
    } 
}

export class BloomPipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game)
    {
        super({
            game: game,
            renderer: game.renderer,
            fragShader:`
                precision mediump float;

                // texcoords from the vertex shader
                varying vec2 outTexCoord;
                
                // our textures coming from p5
                uniform sampler2D tex0;
                uniform sampler2D tex1;
                
                // the mouse value between 0 and 1
                uniform float mouseX;
                
                void main() {
                
                vec2 uv = outTexCoord;
                // the texture is loaded upside down and backwards by default so lets flip it
                uv = 1.0 - uv;
                
                // get the camera and the blurred image as textures
                vec4 cam = texture2D(tex0, uv);
                vec4 blur = texture2D(tex1, uv);
                
                // calculate an average color for the blurred image
                // this is essentially the same as saying (blur.r + blur.g + blur.b) / 3.0;
                float avg = dot(blur.rgb, vec3(0.33333));
                
                // mix the blur and camera together according to how bright the blurred image is
                // use the mouse to control the bloom
                vec4 bloom = mix(cam, blur, clamp(avg*(1.0 + mouseX), 0.0, 1.0));
                
                gl_FragColor = bloom;
                }`
        });
    } 
}

export class DistortPipeline2 extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game)
    {
        super({
            game: game,
            renderer: game.renderer,
            vertShader:`
                precision mediump float;

                uniform mat4 uProjectionMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uModelMatrix;
                
                attribute vec2 inPosition;
                attribute vec2 inTexCoord;
                
                uniform vec2      resolution;
                
                varying vec2 outTexCoord;
                varying vec2 outPosition;
                varying float outTintEffect;
                varying vec4 outTint;
                void main () 
                {
                    outTexCoord = vec2(inTexCoord.x,inTexCoord.y);
                    outPosition = inPosition;
                    float ratiox=(320.+80.)/320.;
                    float ratioy=(240.+80.)/240.;
                
                    vec4 p = uModelMatrix * uViewMatrix * uProjectionMatrix * vec4(outPosition.x*ratiox*2., 640.-outPosition.y*ratioy*2.,1.0,1.0);
                    gl_Position = p;               
                }`,
            fragShader:`
                precision mediump float;
                uniform float     time;
                uniform float     intensity;
                uniform sampler2D uMainSampler;
                varying vec2 outTexCoord;
                void main( void ) {
                    vec2 uv = outTexCoord;
                    
                    //uv.y *= -1.0;
                    uv.x += sin(uv.y*10.+(time*0.1))*0.012;
                    //uv.y += ((sin((uv.x + (time * 0.0004)) * 12.0) * 0.005) + (sin((uv.x - (time * 0.001)) * 50.0) * 0.004));
                    
                    vec4 texColor = texture2D(uMainSampler, uv);
                    if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.){
                        texColor = vec4(0.,0.,0.,0.);
                    }
                    gl_FragColor = texColor;
                }`
        });
    } 
}