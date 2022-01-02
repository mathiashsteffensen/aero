SHELL=/bin/bash

.PHONY: lint test

default:
	make lint test clean compile

compile:
	yarn run tsc -p . $(ARGS) && cp -r lib/tasks/templates dist/js/tasks/templates

clean:
	rm -rf dist/js dist/typings

lint:
	yarn run eslint test/**/*.ts test/*.ts lib/**/*.ts lib/*.ts --fix $(ARGS)

test:
	NODE_ENV=test TS_NODE_FILES=true yarn run mocha $(ARGS)
