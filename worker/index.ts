import { Hono } from 'hono';
import { Container, getContainer } from '@cloudflare/containers';
const app = new Hono<{ Bindings: Env }>();

export class SandboxShellContainer extends Container {
  defaultPort = 8000;
  sleepAfter = '10m';

  async runCommand(command: string, cwd: string) {
    const response = await this.containerFetch("https://container/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({command, cwd})
    });
    return await response.json();
  }
}

app.post('/api/sandbox/:slug', async(c) => {
  const payload = await c.req.json();
  const {slug} = c.req.param();
  const container = getContainer(c.env.SANDBOX_SHELL_CONTAINER, slug);
  const result = await container.runCommand(payload.command, payload.cwd);
  return c.json(result);

});

export default app;
