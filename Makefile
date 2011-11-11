all: 
	@coffee -c --bare -o lib src/*.coffee

dev: 
	@coffee -wc --bare -o lib src/*.coffee

clean: 
	@rm lib/*.js

