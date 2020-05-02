tsc := node_modules/.bin/tsc
ts-node := node_modules/.bin/ts-node
webpack := node_modules/.bin/webpack
postcss := node_modules/.bin/postcss

package_json := package.json package-lock.json
metadata := src/metadata.d.ts worker/metadata.d.ts
assets = $(shell find assets)

src_ts = $(shell find src -type f \( -name '*.ts' -o -name '*.tsx' \) -not -name '*.d.ts')
src_css = $(shell find src -type f -name '*.css')
lib = $(shell find node_modules/react node_modules/react-dom -type f)

target_assets = $(patsubst assets/%,build/%,$(assets))
target_esm = $(patsubst src/%.ts,build/%.js,$(src_ts:.tsx=.ts))
target_es6 = $(patsubst build/%,build.es6/%,$(target_esm)) build/index.es6.js
target_css := build/index.css build/index.css.map
target_lib := build/lib

.PHONY: clean copy_assets copy_lib build_css build_esm watch_esm nomodule build_html dev build

target_dev = $(target_assets) $(target_lib) $(metadata) $(target_esm)
target_prod = $(target_dev) $(target_es6) $(target_css)

clean:
	rm -rf ./build/* ./build.es6/*

$(target_assets): $(assets)
	mkdir -p build
	cp -r assets/* build

copy_assets: $(target_assets)

$(target_lib): $(lib) $(package_json)
	mkdir -p build/lib
	rsync -am --no-links --exclude 'node_modules' node_modules/react node_modules/react-dom build/lib
	touch build/lib

copy_lib: $(target_lib)

$(metadata): $(package_json)
	$(ts-node) -P scripts/tsconfig.json scripts/generate.metadata.ts | tee src/metadata.d.ts > worker/metadata.d.ts

$(target_css): $(src_css) $(package_json)
	$(postcss) src/index.css -m -d build

build_css: $(target_css)


$(target_esm): $(metadata) $(src_ts) $(package_json)
	$(tsc) -b

build_esm: $(target_esm)

watch_esm:
	$(tsc) -b -w

$(target_es6): $(metadata) $(src_ts) $(package_json)
	$(tsc) -b tsconfig.es6.json
	$(webpack) -p

nomodule: $(target_es6)


build_html:
	$(ts-node) -P scripts/tsconfig.json scripts/index.html.tsx > build/index.html

dev: export NODE_ENV=development
dev: $(target_dev) build_html watch_esm

build: export NODE_ENV=production
build: $(target_prod) build_html

deploy: export NODE_ENV=production
deploy: export USE_CDN=USE_CDN
deploy: $(target_prod) build_html
