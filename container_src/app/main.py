from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
import asyncio, re

app = FastAPI()
HOME_DIR = Path.home()                        # → /root inside this image
_CWD_MARKER = "__CWD__:"                      # unique tag we’ll search for


class CommandRequest(BaseModel):
    command: str = Field(..., description="Shell command to run")
    cwd: str | None = Field(
        default=None, description="Directory to run the command from"
    )


async def _run(cmd: str, cwd: Path):
    """
    Run *cmd* in *cwd* and return (rc, stdout, stderr, final_dir).

    We append a printf that prints our marker + $PWD; afterwards we
    peel that line off stdout to learn where the shell ended up.
    """
    wrapped_cmd = f'{cmd}; printf "{_CWD_MARKER}%s\\n" "$PWD"'

    proc = await asyncio.create_subprocess_exec(
        "bash", "-c", wrapped_cmd,
        cwd=str(cwd),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    rc, out, err = proc.returncode, stdout.decode(), stderr.decode()

    # --- extract the marker line ---
    m = re.search(rf"{_CWD_MARKER}(.*)\s*$", out)
    final_dir = Path(m.group(1)) if m else cwd
    if m:                                           # strip marker from output
        out = out[: m.start()].rstrip("\n")

    return rc, out, err, final_dir


@app.post("/run")
async def run_command(payload: CommandRequest):
    # determine starting directory
    cwd = Path(payload.cwd).expanduser().resolve() if payload.cwd else HOME_DIR
    if not cwd.is_dir():
        raise HTTPException(400, f"{cwd} is not a directory")

    rc, out, err, final_dir = await _run(payload.command, cwd)

    return {
        "cwd": str(final_dir),          # ← where the shell *actually* is now
        "return_code": rc,
        "stdout": out,
        "stderr": err,
    }
