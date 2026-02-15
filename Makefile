.PHONY: dev-up dev-down prod-up prod-down down logs dev-logs build \
       ui be tunnel app app-prebuild app-android app-ios app-android-sim app-ios-sim \
       app-apk app-aab

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

# --- Local dev (without Docker) ---

ui:
	cd ui && npm run dev

be:
	cd be && . .venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

tunnel:
	cloudflared tunnel --url http://localhost:8000

app-prebuild:
	cd app && npx expo prebuild --clean

app:
	cd app && npx expo start

app-android:
	cd app && npx expo run:android

app-ios:
	cd app && npx expo run:ios

app-apk:
	cd app/android && ./gradlew assembleRelease

app-aab:
	cd app/android && ./gradlew bundleRelease
