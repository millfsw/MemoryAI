# Troubleshooting Guide

## Common Errors

### Error: "Failed to generate content: Error code: 403 - {'error': {'message': 'Forbidden'}}"

This error occurs when the AI API (DashScope/Qwen) rejects your API key. Here's how to fix it:

#### Possible Causes:

1. **API Key Not Configured**
   - The `AI_API_KEY` environment variable is empty or not set
   - **Solution**: Add your API key to the `.env` file in the backend directory

2. **Invalid API Key**
   - The API key is incorrect, expired, or revoked
   - **Solution**: Generate a new API key from your provider's dashboard

3. **Insufficient Credits/Quota**
   - Your API account has run out of credits or exceeded the rate limit
   - **Solution**: Check your account balance and billing settings

4. **Wrong API Endpoint**
   - The `AI_API_BASE_URL` is incorrect
   - **Solution**: Verify the base URL matches your provider

#### Step-by-Step Fix:

1. **Open your backend `.env` file**:
   ```
   backend/.env
   ```
   (If it doesn't exist, copy from `backend/.env.example`)

2. **Set your API key**:
   ```env
   AI_API_KEY=your_actual_api_key_here
   AI_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   AI_MODEL=qwen3-coder-plus
   ```

3. **Restart the backend**:
   ```powershell
   docker-compose restart backend
   ```
   Or if running locally:
   ```powershell
   # Stop the running backend (Ctrl+C)
   # Then restart it
   ```

4. **Test the configuration**:
   - Try generating flashcards again
   - Check backend logs for detailed error messages:
     ```powershell
     docker-compose logs backend
     ```

#### Getting a New API Key (DashScope/Qwen):

1. Visit: https://dashscope.console.aliyun.com/
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy and paste it into your `.env` file

#### Alternative: Use a Different AI Provider

If you're having issues with DashScope, you can switch to another provider:

**OpenAI:**
```env
AI_API_KEY=sk-your-openai-key
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
```

**Groq (Free Tier Available):**
```env
AI_API_KEY=gsk-your-groq-key
AI_API_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-70b-versatile
```

---

### Error: "AI_API_KEY is not configured"

This means the `AI_API_KEY` environment variable is completely empty.

**Solution**:
1. Open `backend/.env`
2. Add: `AI_API_KEY=your_api_key_here`
3. Restart the backend

---

### Error: "AI API error (401): Invalid authentication credentials"

Your API key is invalid or malformed.

**Solution**:
1. Double-check the API key for typos
2. Make sure there are no extra spaces before/after the key
3. Generate a new API key if necessary

---

### Error: "AI API error (429): Rate limit exceeded"

You've exceeded the API's rate limit.

**Solution**:
1. Wait a moment and try again
2. Upgrade your API plan for higher limits
3. Add billing information to your account

---

## How to Check Backend Logs

### Using Docker:
```powershell
docker-compose logs backend
```

### View live logs:
```powershell
docker-compose logs -f backend
```

### Last 50 lines:
```powershell
docker-compose logs --tail=50 backend
```

---

## Verifying Your Setup

1. **Check if backend is running**:
   ```powershell
   docker-compose ps
   ```

2. **Test health endpoint**:
   ```
   http://localhost:8000/health
   ```

3. **Check environment variables**:
   ```powershell
   docker-compose exec backend env | grep AI_
   ```

---

## Still Having Issues?

1. **Clear Docker cache and rebuild**:
   ```powershell
   docker-compose down
   docker-compose up -d --build
   ```

2. **Check file permissions**:
   Ensure `.env` file is readable by the Docker container

3. **Test with a simple API call**:
   Use a tool like Postman or curl to test the AI API directly with your key
