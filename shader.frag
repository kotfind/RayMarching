#version 330

#define MARCHING_ITERATIONS 100.
#define RAY_INTER_TRASHOLD 0.01
#define ZFAR 100.

#define inf 1000000.

uniform float time;
uniform ivec2 resolution;
uniform vec3 pos;
uniform vec3 ff;
uniform vec3 rr;
uniform vec3 uu;

struct Material { float ka, kd, ks, a; };
Material materials[1];

float map(in vec3 p) {
    return length(p - vec3(0., 0., 3.)) - 1.;
}

vec3 calcNorm(in vec3 p) {
    const vec2 e = vec2(0., 0.001);
    float d = map(p);
    float dx = map(p + e.yxx) - d;
    float dy = map(p + e.xyx) - d;
    float dz = map(p + e.xxy) - d;
    return normalize(vec3(dx, dy, dz));
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
    const vec3 sceneColor = vec3(0.);
    float t = marching(ro, rd);
    if (t < inf - 10) {
        vec3 p = ro + t * rd;
        vec3 norm = calcNorm(p);

        float diffuseIntensity = 0;
        float specularIntensity = 0;
        float ambientIntensity = 0.1;
        vec3 lightDir = normalize(vec3(2., 5., -1.) - p);
        diffuseIntensity  += max(0., dot(lightDir, norm));
        specularIntensity += pow(max(0., dot(reflect(lightDir, norm), rd)), materials[0].a);

        return vec3(1.) * vec3(ambientIntensity * materials[0].ka) + 
               vec3(1.) * vec3(diffuseIntensity * materials[0].kd) +
               vec3(1.) * vec3(specularIntensity * materials[0].ks);
    }
    return sceneColor;
}

out vec4 fragColor;
void main() {
    materials[0] = Material(1., 0.6, 0.3, 50.);

    vec2 uv = (gl_FragCoord.xy - 0.5*vec2(resolution)) / float(min(resolution.x, resolution.y));

    vec3 ro = pos;
    vec3 rd = normalize(uv.x*rr + uv.y*uu + 1.*ff);

    fragColor = vec4(rayCast(ro, rd), 1.);
}
