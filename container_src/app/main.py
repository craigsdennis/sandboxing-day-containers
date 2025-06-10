from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
import asyncio

app = FastAPI()

HOME_DIR = Path.home()  # /root inside this image


class CommandRequest(BaseModel):
    command: str = Field(..., description="Shell command to run")
    cwd: str | None = Field(
        default=None,
        description="Directory to run the command from (defaults to home)",
    )


async def _run(cmd: str, cwd: Path):
    """
    Spawn a shell command in *cwd* and collect its output.
    """
    proc = await asyncio.create_subprocess_shell(
        cmd,
        cwd=str(cwd),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    return proc.returncode, stdout.decode(), stderr.decode()


@app.post("/run")
async def run_command(payload: CommandRequest):
    # Resolve the directory
    cwd = Path(payload.cwd).expanduser() if payload.cwd else HOME_DIR
    cwd = cwd.resolve()

    if not cwd.is_dir():
        raise HTTPException(status_code=400, detail=f"{cwd} is not a directory")

    rc, out, err = await _run(payload.command, cwd)

    # Always tell the client which directory we executed in
    return {
        "cwd": str(cwd),
        "return_code": rc,
        "stdout": out,
        "stderr": err,
    }
