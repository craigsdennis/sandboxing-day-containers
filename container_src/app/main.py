import asyncio
from pathlib import Path  #  ⬅️ NEW

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

HOME_DIR = Path.home()  # → /root


class CommandRequest(BaseModel):
    command: str


async def _run(cmd: str):
    proc = await asyncio.create_subprocess_shell(
        cmd,
        cwd=str(HOME_DIR),  #  ⬅️ START HERE
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    return proc.returncode, stdout.decode(), stderr.decode()


@app.post("/run")
async def run_command(payload: CommandRequest):
    rc, out, err = await _run(payload.command)
    return {"return_code": rc, "stdout": out, "stderr": err}
