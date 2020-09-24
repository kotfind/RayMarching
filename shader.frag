#version 330

#define MARCHING_ITERATIONS 100.
#define RAY_INTER_TRASHOLD 0.01
#define ZFAR 100.

#define inf 1000000.

uniform float time;
uniform ivec2 resolution;

float map(in vec3 p) {
    return length(p - vec3(0., 0., 5.)) - 1.;
}

vec3 calcNorm(in vec3 p) {
    const vec2 e = vec2(0., 0.001);
    float d = map(p);
    float dx = map(p + e.yxx) - d;
    float dy = map(p + e.xyx) - d;
    float dz = map(p + e.xxy) - d;
    return normalize(vec3(dx, dy, dz));
}

vec3 lights(in vec3 p, in vec3 norm, in vec3 color) {
    float diffuse_intensity  = 0.1;

    diffuse_intensity += 1. * max(0., dot(normalize(vec3(2., 5., -1.) - p), norm));

    return diffuse_intensity * color;
}

float marching(in vec3 ro, in vec3 rd) {
    float t = 0.;
    for (float i = 0.; i < MARCHING_ITERATIONS; ++i) {
        vec3 p = ro + rd*t;

        float h = map(p);
        if (h < RAY_INTER_TRASHOLD) break;
        if (h > ZFAR) break;
        t += h;
    }
    if (t > ZFAR) t = inf;
    return t;
}

vec3 rayCast(in vec3 ro, in vec3 rd) {
    float t = marching(ro, rd);
    if (t < inf - 10) {
        vec3 p = ro + t * rd;
        vec3 norm = calcNorm(p);

        return lights(p, norm, vec3(1.));
    }
    return vec3(0.);
}

out vec4 fragColor;
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5*vec2(resolution)) / float(min(resolution.x, resolution.y));

    vec3 ro = vec3(0., 0., 0.);
    vec3 rd = normalize(vec3(uv, 1.));

    fragColor = vec4(rayCast(ro, rd), 1.);
}
