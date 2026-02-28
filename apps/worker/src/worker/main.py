import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from worker.asset_processing.handlers import handle_image_message, handle_pdf_message
from worker.libs.aws.pollers import run_images_poller, run_pdf_poller

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger(__name__)

_pdf_task: asyncio.Task | None = None
_images_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start pollers on startup, cancel on shutdown."""
    global _pdf_task, _images_task
    log.info("Starting PDF and image queue pollers")
    loop = asyncio.get_event_loop()
    _pdf_task = loop.create_task(run_pdf_poller(handle_pdf_message))
    _images_task = loop.create_task(run_images_poller(handle_image_message))
    yield
    log.info("Stopping pollers")
    if _pdf_task:
        _pdf_task.cancel()
        try:
            await _pdf_task
        except asyncio.CancelledError:
            pass
    if _images_task:
        _images_task.cancel()
        try:
            await _images_task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="SuperNeuro Worker", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}
