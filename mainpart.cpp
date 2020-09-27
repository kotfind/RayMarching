#define GL_GLEXT_PROTOTYPES

#include <SDL2/SDL.h>
#include <SDL2/SDL_opengl.h>

extern SDL_Window *win;
extern GLuint program;

void mainpart(void) {
    // Get uniform locations
    GLuint uTime       = glGetUniformLocation(program, "time");
    GLuint uResolution = glGetUniformLocation(program, "resolution");
    GLuint uPos        = glGetUniformLocation(program, "pos");
    GLuint uFF         = glGetUniformLocation(program, "ff");
    GLuint uUU         = glGetUniformLocation(program, "uu");
    GLuint uRR         = glGetUniformLocation(program, "rr");

    SDL_Event e;
    float lastTime = SDL_GetTicks() / 1000.;

    float pos[3] = {0., 0., 0.};
    float phi = 0., theta = 0.;

    SDL_SetRelativeMouseMode(SDL_TRUE);
    // Mainloop
    for(;;) {
        // Count time
        float time = SDL_GetTicks() / 1000.;
        float dTime = lastTime - time;
        lastTime = time;

        // Count resolution
        int W, H;
        SDL_GetWindowSize(win, &W, &H);
        glViewport(0, 0, W, H);

        // Event loop
        bool quit = 0;
        while (SDL_PollEvent(&e) != 0) {
            if (e.type == SDL_QUIT) {
                quit = 1;
            } else if (e.type == SDL_MOUSEMOTION) {
                phi   -= e.motion.yrel * 0.002;
                theta += e.motion.xrel * 0.002;

                phi = fmin(float(M_PI/2. - 0.001), fmax(float(-M_PI/2. + 0.001), phi));
            }
        }
        if (quit) break;

        // Count direction vectors
        float ff[3] = {float(sin(-phi + M_PI/2.) * cos(theta + M_PI/2.)),
                float(cos(-phi + M_PI/2.)),
                float(sin(-phi + M_PI/2.) * sin(theta + M_PI/2.))};
        float l = sqrt(ff[0]*ff[0] + ff[1]*ff[1] + ff[2]*ff[2]);
        for (float &e : ff) e /= l;
        float rr[3] = {-ff[2], 0., ff[0]};
        l = sqrt(rr[0]*rr[0] + rr[2]*rr[2]);
        for (float &e : rr) e /= l;
        float uu[3] = {-rr[2]*ff[1], rr[2]*ff[0] - rr[0]*ff[2], rr[0]*ff[1]};
        l = sqrt(uu[0]*uu[0] + uu[1]*uu[1] + uu[2]*uu[2]);
        for (float &e : uu) e /= l;

        // Keyboard
        const Uint8 *key = SDL_GetKeyboardState(NULL);

        float dPos[3] = {0., 0., 0.};
        float speedFactor = 1.;
        if (key[SDL_SCANCODE_LSHIFT]) speedFactor = 3.;
        if (key[SDL_SCANCODE_W]) dPos[2] -= 5. * dTime * speedFactor;
        if (key[SDL_SCANCODE_S]) dPos[2] += 5. * dTime * speedFactor;
        if (key[SDL_SCANCODE_D]) dPos[0] -= 5. * dTime * speedFactor;
        if (key[SDL_SCANCODE_A]) dPos[0] += 5. * dTime * speedFactor;
        for (int i = 0; i < 3; ++i) pos[i] += dPos[0]*rr[i] + dPos[1]*uu[i] + dPos[2]*ff[i];

        // Set uniforms
        glUniform1f(uTime, time);
        glUniform2i(uResolution, W, H);
        glUniform3fv(uPos, 1, pos);
        glUniform3fv(uFF, 1, ff);
        glUniform3fv(uRR, 1, rr);
        glUniform3fv(uUU, 1, uu);

        glClear(GL_COLOR_BUFFER_BIT);
        glRectf(-1., -1., 1., 1.);

        SDL_GL_SwapWindow(win);
    }
}
