import json
import logging
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger(__name__)

class WebhookResponder:
    def __init__(self, webhook_url: str, timeout: int = 10) -> None:
        self.webhook_url = webhook_url
        self.timeout = timeout

    async def send_response(
        self,
        index_address: str,
        data: Optional[Dict[str, Any]] = None,
        status: str = "SUCCEED",
    ) -> bool:
        """
        Send response data to the webhook URL using POST method.

        :param index_address: The index address to include in the payload
        :param data: Optional dictionary data to send along with the address
        :param status: Either 'SUCCEED' or 'FAILED'
        :return: True if the request succeeded (HTTP 2xx), False otherwise
        """
        payload = {
            "index_address": index_address,
            "data": data or {},
            "status": status,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.webhook_url,
                    headers={"Content-Type": "application/json"},
                    content=json.dumps(payload),
                )
                response.raise_for_status()

            logger.info(f"Webhook sent to {self.webhook_url}: {payload}")
            return True

        except Exception as e:
            logger.exception(f"Failed to send webhook to {self.webhook_url}: {e}")
            return False