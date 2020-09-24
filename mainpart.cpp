#define GL_GLEXT_PROTOTYPES

#include <SDL2/SDL.h>
#include <SDL2/SDL_opengl.h>

extern SDL_Window *win;
extern GLuint program;

void mainpart(void) {
    // Get uniform locations
    GLuint uTime = glGetUniformLocation(program, "time");
    GLuint uResolution = glGetUniformLocation(program, "resolution");

    // Mainloop
    SDL_Event e;
    float last_time = SDL_GetTicks() / 1000.;
    for(;;) {
        // Count time
        float time = SDL_GetTicks() / 1000.;
        float dtime = last_time - time;
        last_time = time;

        // Count resolution
        int W, H;
        SDL_GetWindowSize(win, &W, &H);
        glViewport(0, 0, W, H);

        // Event loop
        bool quit = 0;
        while (SDL_PollEvent(&e) != 0) {
            if (e.type == SDL_QUIT) {
                quit = 1;
            }
        }
        if (quit) break;

        // Keyboard
        const Uint8 *key = SDL_GetKeyboardState(NULL);

        // Set uniforms
        glUniform1f(uTime, time);
        glUniform2i(uResolution, W, H);

        glClear(GL_COLOR_BUFFER_BIT);
        glRectf(-1., -1., 1., 1.);

        SDL_GL_SwapWindow(win);
    }
}
