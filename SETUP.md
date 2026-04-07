# MemoryAI - Quick Setup Guide

## 🚀 Qwen API Setup (Recommended)

### Step 1: Get Your API Key

1. Go to https://dashscope.console.aliyun.com/
2. Sign up (if you haven't already)
3. Navigate to the **API Keys** section
4. Create a new key
5. Copy the key

### Step 2: Update Your .env File

Open the `.env` file and update:

```env
AI_API_KEY=your_copied_key_here
AI_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen3-coder-plus
```

### Step 3: Restart the Backend

```bash
docker-compose restart backend
```

---

## 🎯 Available Qwen Models

| Model | Description | Recommended |
|--------|-------------|-------------|
| `qwen3-coder-plus` | Smart, works well with text | ✅ Default |
| `qwen3-coder-next` | Latest version | |
| `qwen3-max` | Maximum quality | |
| `qwen3.5-plus` | Balance of speed/quality | |

To change the model, simply update `AI_MODEL` in your `.env` file.

---

## 🔧 Alternative AI Providers

If you want to use a different service, update your `.env`:

### OpenAI
```env
AI_API_KEY=sk-xxx
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
```

### Groq (Free Tier Available)
```env
AI_API_KEY=gsk_xxx
AI_API_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-70b-versatile
```

### GigaChat
```env
AI_API_KEY=xxx
AI_API_BASE_URL=https://gigachat.devices.sberbank.ru/api/v1
AI_MODEL=GigaChat
```

---

## ⚡ Quick Start

After setting up your API key:

1. Start Docker:
   ```bash
   docker-compose up -d
   ```

2. Open: http://localhost:5173

3. Upload a file (.txt, .pdf, .docx) or paste text

4. Click Generate!

---

## ❓ Troubleshooting

### "Failed to fetch" Error
- Make sure Docker is running
- Check status: `docker-compose ps`
- Backend should be in `healthy` status

### API Key Error
- Verify your key is correct
- Make sure you have credits on your account
- Check logs: `docker-compose logs backend`

### Containers Won't Start
```bash
docker-compose down
docker-compose up -d --build
```
