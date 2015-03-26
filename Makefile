
BIN := ./node_modules/.bin
MOCHA ?= $(BIN)/mocha

test: node_modules
	@$(MOCHA)

node_modules: package.json
	@npm install

.PHONY: test
