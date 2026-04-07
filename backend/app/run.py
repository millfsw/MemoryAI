import uvicorn
from app.settings import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.ADDRESS,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
