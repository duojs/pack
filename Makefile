
BIN := ./node_modules/.bin
MOCHA ?= $(BIN)/mocha

# make sure the right flags are given to various node versions
# (while still allowing override locally)
ifeq ($(TRAVIS_NODE_VERSION),0.10)
	MOCHA_FLAGS ?= --require gnode
else ifeq ($(TRAVIS_NODE_VERSION),0.11)
	MOCHA_FLAGS ?= --harmony-generators
else ifeq ($(TRAVIS_NODE_VERSION),0.12)
	MOCHA_FLAGS ?= --harmony-generators
endif

test: node_modules
	@$(MOCHA) $(MOCHA_FLAGS)

node_modules: package.json
	@npm install

.PHONY: test
