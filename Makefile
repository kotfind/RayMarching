CFLAGS=-lGL -lSDL2

all: main.out

main.out: main.o mainpart.o
	g++ main.o mainpart.o $(CFLAGS) -o main.out

main.o: main.cpp
	g++ -c main.cpp

mainpart.o: mainpart.cpp
	g++ -c mainpart.cpp

run: main.out
	./main.out

clean:
	rm -f main.out
	rm -f main.o
	rm -f mainpart.o
