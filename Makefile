CFLAGS=-march=native -Wall -Wextra -Wpedantic -std=c++2a -g3 -O0
LDFLAGS=-lGL -lSDL2 -std=c++2a -g3 -O0

all: main.out

main.out: main.o mainpart.o
	g++ main.o mainpart.o $(LDFLAGS) -o main.out

main.o: main.cpp
	g++ $(CFLAGS) -c main.cpp

mainpart.o: mainpart.cpp
	g++ $(CFLAGS) -c mainpart.cpp

run: main.out
	./main.out

clean:
	rm -f main.out
	rm -f main.o
	rm -f mainpart.o
