install:
	npm ci

publish:
	npm publish --dry-run

test:
	npm test -- --watch

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .
