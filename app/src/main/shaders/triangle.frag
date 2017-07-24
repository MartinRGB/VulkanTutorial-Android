#version 450
#extension GL_ARB_separate_shader_objects : enable


layout(location = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
    float iGlobalTime;
    float iWidth;
    float iHeight;
} ubo;

layout(location = 0) out vec4 outColor;
layout(location = 0) in vec3 fragColor;


#define u_time    ubo.iGlobalTime

#define gl_FragColor    outColor

#define DEF_USE_IMAGE_SHADER                1

// shadertoy shaders usually correct for gamma in the shader code
// we have a real sRGB target and need to write a linear color
// if you do not want to compensate uncomment this define
#define DEF_USE_SRGB_TO_LINEAR_CONVERSION   1


float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 8

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}


void main() {

    vec2 uv = gl_FragCoord.xy/vec2(ubo.iHeight) * 4.;

    vec2 st =uv;

    vec3 color = vec3(0.0);

        vec2 q = vec2(0.);
        q.x = fbm( st + 0.00*u_time);
        q.y = fbm( st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time *10.);
        r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time * 10.);

        float f = fbm(st+r);

        color = mix(vec3(st.x,cos(u_time/10.),sin(u_time/10.)),
                    vec3(st.y,sin(u_time/10.),sin(u_time/10.)*cos(u_time/10.)),
                    clamp((f*f)*4.0,0.0,1.0));

        color = mix(color,
                    vec3(0,0,0.164706),
                    clamp(length(q),.0,1.0));

        color = mix(color,
                    vec3(0.666667,1,1),
                    clamp(length(r.x),0.0,1.0));


    outColor = vec4((f*f*f+.6*f*f+.5*f)*color,1.);
    //outColor = vec4(uv.x,uv.y,1.,1.);
    //outColor = vec4(vec3(sin(ubo.iGlobalTime),cos(ubo.iGlobalTime),0.), 1.0);
}


//// SHADERTOY SHADER ENDS HERE
/////////////////////////////////////////////////////////////////////////////////
//
//float sRgbToLinear(const float sRgbColor)
//{
//    if (sRgbColor <= 0.04045)
//        return sRgbColor / 12.92;
//    else
//        return pow((sRgbColor + 0.055) / 1.055, 2.4);
//}
//
//vec3 sRgbToLinearVec(const vec3 sRgbColor)
//{
//    return vec3(
//        sRgbToLinear(sRgbColor.r),
//        sRgbToLinear(sRgbColor.g),
//        sRgbToLinear(sRgbColor.b)
//    );
//}
//
//void main(void)
//{
//#if (DEF_USE_IMAGE_SHADER == 1)
//    mainImage(out_fragColor, vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y));
//#endif
//
//#if (DEF_USE_SRGB_TO_LINEAR_CONVERSION == 1)
//    out_fragColor.rgb = sRgbToLinearVec(out_fragColor.rgb);
//#endif
//}
//
/////////////////////////////////////////////////////////////////////////////////
