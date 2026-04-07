# MemoryAI - Quick Setup Guide

## 🚀 Настройка Qwen API (Рекомендуется)

### Шаг 1: Получи API ключ

1. Зайди на https://dashscope.console.aliyun.com/
2. Зарегистрируйся (если ещё не зарегистрирован)
3. Перейди в раздел **API Keys**
4. Создай новый ключ
5. Скопируй ключ

### Шаг 2: Обнови .env файл

Открой файл `.env` и измени:

```env
AI_API_KEY=тво_скопированный_ключ_сюда
AI_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen3-coder-plus
```

### Шаг 3: Перезапусти backend

```powershell
docker-compose restart backend
```

---

## 🎯 Доступные модели Qwen

| Модель | Описание | Рекомендуемая |
|--------|----------|---------------|
| `qwen3-coder-plus` | Умная, хорошо работает с текстом | ✅ По умолчанию |
| `qwen3-coder-next` | Новейшая версия | |
| `qwen3-max` | Максимальное качество | |
| `qwen3.5-plus` | Баланс скорости/качества | |

Для изменения модели просто поменяй `AI_MODEL` в `.env`.

---

## 🔧 Альтернативные AI провайдеры

Если хочешь использовать другой сервис, обнови `.env`:

### OpenAI
```env
AI_API_KEY=sk-xxx
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
```

### Groq (бесплатный тир)
```env
AI_API_KEY=gsk_xxx
AI_API_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-70b-versatile
```

### GigaChat (для России)
```env
AI_API_KEY=xxx
AI_API_BASE_URL=https://gigachat.devices.sberbank.ru/api/v1
AI_MODEL=GigaChat
```

---

## ⚡ Быстрый старт

После настройки API ключа:

1. Запусти Docker:
   ```powershell
   docker-compose up -d
   ```

2. Открой: http://localhost:5173

3. Загрузи файл (.txt, .pdf, .docx) или вставь текст

4. Нажми Generate!

---

## ❓ Troubleshooting

### Ошибка "Failed to fetch"
- Убедись, что Docker запущен
- Проверь статус: `docker-compose ps`
- Backend должен быть в статусе `healthy`

### Ошибка API ключа
- Проверь, что ключ правильный
- Убедись, что на счету есть кредиты
- Посмотри логи: `docker-compose logs backend`

### Контейнеры не запускаются
```powershell
docker-compose down
docker-compose up -d --build
```
