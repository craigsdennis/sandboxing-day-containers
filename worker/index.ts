import { Hono } from 'hono';
import { Container } from 'cf-containers';
const app = new Hono<{ Bindings: Env }>();

export class SandboxShellContainer extends Container {
  defaultPort = 8000;
  sleepAfter = '10m';

  async runCommand(command: string) {
    const response = await this.containerFetch("https://container/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({command})
    }, this.defaultPort);
    return await response.json();
  }
}

app.post('/sandbox/:slug', async(c) => {
  const payload = await c.req.json();
  const {slug} = c.req.param();
  const id = c.env.SANDBOX_SHELL_CONTAINER.idFromName(slug);
  const container = c.env.SANDBOX_SHELL_CONTAINER.get(id);
  const result = await container.runCommand(payload.command);
  return c.json(result);

});

export default app;
