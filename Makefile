.PHONY: install-python lint-python format-python test-python build-python lint-web format-web test-web build-web verify

install-python:
	python -m pip install -e ".[dev]"

lint-python:
	python -m ruff check backend workers
	python -m black --check backend workers

format-python:
	python -m ruff check --fix backend workers
	python -m black backend workers

test-python:
	python -m pytest

build-python:
	python -m compileall -q backend workers

lint-web:
	npm --prefix apps/frontend run lint

format-web:
	npm --prefix apps/frontend run format:check

test-web:
	npm --prefix apps/frontend run test

build-web:
	npm --prefix apps/frontend run build

verify: lint-python test-python build-python lint-web test-web build-web
