import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"\n=======================================================")
    print(f" Secure Resource Recommendation System (FastAPI Engine) ")
    print(f"=======================================================")
    print(f" * API Server:      http://localhost:{port}")
    print(f" * Swagger Docs:    http://localhost:{port}/docs")
    print(f" * ReDoc Docs:      http://localhost:{port}/redoc")
    print(f" * Healthcheck:     http://localhost:{port}/api/health")
    print(f"=======================================================\n")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
