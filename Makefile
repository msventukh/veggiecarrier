# Runs the game on a local static web server (needed for YouTube questions).
#
#   make start   start the server in the background and open the game
#   make stop    shut the server down
#
# The port can be changed: make start PORT=8080

PORT ?= 8000
URL := http://localhost:$(PORT)
PID_FILE := .server.pid
LOG_FILE := .server.log

.PHONY: start stop

start:
	@if [ -f $(PID_FILE) ] && kill -0 "$$(cat $(PID_FILE))" 2>/dev/null; then \
		echo "Already running at $(URL) (PID $$(cat $(PID_FILE)))."; \
		exit 0; \
	fi; \
	if curl -s -o /dev/null $(URL); then \
		echo "Port $(PORT) is already in use by another program. Try: make start PORT=8080"; \
		exit 1; \
	fi; \
	python3 -m http.server $(PORT) --bind 127.0.0.1 >$(LOG_FILE) 2>&1 & \
	echo $$! >$(PID_FILE); \
	for i in 1 2 3 4 5 6 7 8 9 10; do \
		curl -s -o /dev/null $(URL) && break; \
		if ! kill -0 "$$(cat $(PID_FILE))" 2>/dev/null; then \
			rm -f $(PID_FILE); \
			echo "The server failed to start:"; cat $(LOG_FILE); \
			exit 1; \
		fi; \
		sleep 0.3; \
	done; \
	echo "Running at $(URL) (stop it with: make stop)"; \
	if command -v open >/dev/null 2>&1; then open $(URL); fi

stop:
	@if [ -f $(PID_FILE) ] && kill "$$(cat $(PID_FILE))" 2>/dev/null; then \
		echo "Stopped."; \
	else \
		echo "Not running."; \
	fi; \
	rm -f $(PID_FILE)
