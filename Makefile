.PHONY: dev test lint build seed

dev:
	docker-compose up --build

test:
	npm -ws run test

lint:
	npm -ws run lint

build:
	npm -ws run build

seed:
	npm --workspace apps/backend run seed
