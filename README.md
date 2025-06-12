# Use Cloudflare Containers to Execute Sandboxed Code

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/craigsdennis/sandboxing-day-containers)

[<img src="https://img.youtube.com/vi/ILXqT-ddIFw/0.jpg">](https://youtu.be/ILXqT-ddIFw "TITLE")

[Cloudflare Containers](https://developers.cloudflare.com/containers/) are here and this code explores building a sandboxed code execution environment.

By defining a [Linux + Python based Docker Container](./Dockerfile), we build a [FastAPI server](https://fastapi.tiangolo.com/) to execute a process in the container.

## Deploy

Click the Deploy to Cloudflare button, or run things manually.

```bash
npm run deploy
```
