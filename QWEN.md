## Qwen Added Memories
- При деплое MemoryAI на ВМ: nginx.conf требует `resolver 127.0.0.11` для резолвинга Docker-сервисов, фронтенд использует `VITE_API_URL=/api` (относительный путь), `docker-compose.yml` без поля `version`. Команда на ВМ: `docker compose up -d --build frontend`
