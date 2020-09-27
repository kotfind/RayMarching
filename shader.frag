#version 330

#define MARCHING_ITERATIONS 100.
#define RAY_INTER_TRASHOLD 0.001
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

float add(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0-h);
}

float sub(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5*(d2+d1)/k, 0.0, 1.0);
    return mix(d2, -d1, h) + k*h*(1.0-h);
}

float map(in vec3 p) {
    float d = inf;

    d = min(d, p.y + 5 + 1.*sin(p.x*1.)*sin(p.z*1.));
    for (float y = -1; y <= 1; y += 1) {
        vec3 q = vec3(p.x, 1. + mod(p.y + y*5. + 5., 10.) - 5., p.z);
        d = min(d, length(q - vec3(-3., 0., 3.)) - 1. + 0.15*sin(q.x*10)*sin(q.y*10)*sin(q.z*10)*sin(time*3.));
    }

    vec3 q = abs(p - vec3(4., -1., 3.)) - vec3(1., 1., 1.);
    d = min(d, length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.));
    d = add(d, length(p - vec3(4., -1., 3.) + vec3(2.)*sin(time*2.)) - 1., 1.);
    d = add(d, length(p - vec3(4., -1., 3.) + vec3(-2.)*sin(time*4.)) - 1., 1.);

    return d;
}

vec3 calcNorm(in vec3 p) {
    const vec2 e = vec2(0., 0.0001);
    float d = map(p);
    float dx = map(p + e.yxx) - d;
    float dy = map(p + e.xyx) - d;
    float dz = map(p + e.xxy) - d;
    return normalize(vec3(dx, dy, dz));
}

float marching(in vec3 ro, in vec3 rd) {
    float t = 0.001;
    for (float i = 0.; i < MARCHING_ITERATIONS; ++i) {
        vec3 p = ro + rd*t;

        float h = map(p);
        if (abs(h) < RAY_INTER_TRASHOLD) break;
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

        float ambientIntensity = 0.1;
        vec3 lightDir = normalize(vec3(2., 4., -1.));
        float diffuseIntensity  = 0.5 + 0.5*dot(lightDir, norm);
        float specularIntensity = pow(max(0., dot(reflect(lightDir, norm), rd)), materials[0].a);
        float shadow            = max(0.3, step(inf - 10., marching(p + norm*0.05, lightDir)));

        return (ambientIntensity * materials[0].ka + 
               (diffuseIntensity * materials[0].kd +
               specularIntensity * materials[0].ks) * shadow) * vec3(1.);
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
