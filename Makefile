all: build deploy

dev:
	npm run dev

build:
	npm run build

deploy:
	scp -r dist/* user@192.168.0.107:/var/www/html
