.PHONY: dev-up dev-down prod-up prod-down down logs dev-logs build

dev-up:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

prod-up:
	docker compose -f docker-compose.yml up --build -d

prod-down:
	docker compose -f docker-compose.yml down

down:
	-docker compose -f docker-compose.dev.yml down --remove-orphans
	-docker compose -f docker-compose.yml down --remove-orphans

logs:
	docker compose -f docker-compose.yml logs -f

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

build:
	docker compose -f docker-compose.yml build
