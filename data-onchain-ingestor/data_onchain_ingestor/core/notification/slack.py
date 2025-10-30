from typing import Any, List, Optional

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from data_onchain_ingestor.config.config import get_logger, ENVIRONMENT


class SlackNotification:
    # Constants representing various statuses
    STATUS_SYNCING = "SYNCING"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_TERMINATED = "TERMINATED"
    STATUS_WARNING = "WARNING"

    def __init__(
        self,
        api_token: str,
        channel: str,
        warning_channel: str = None,
        enabled: bool = True,
    ):
        """
        Initialize SlackNotification with API token, channel, and warning channel.
        If not provided, these values are taken from environment variables.

        :param api_token: Slack API token
        :param channel: Default Slack channel
        :param warning_channel: Slack channel for warnings
        :param enabled: Whether to enable Slack notification (default: True)
        """
        if not warning_channel:
            warning_channel = channel

        self.client = WebClient(token=api_token)
        self.channel = channel
        self.warning_channel = warning_channel
        self.logger = get_logger(__name__)

        # ✅ Add flag to enable/disable notifications
        self.enabled = enabled

    def __get_status_color(self, status: str) -> str:
        if status == self.STATUS_COMPLETED or status == self.STATUS_SYNCING:
            return "#36a64f"
        elif status == self.STATUS_WARNING:
            return "#f2c744"
        elif status == self.STATUS_TERMINATED:
            return "#f24444"
        else:
            return "#f2c744"

    def __get_channel(self, status: str) -> str:
        if status == self.STATUS_WARNING:
            return self.warning_channel
        else:
            return self.channel

    def __get_block_header(self, title: str) -> list[dict[str, Any]]:
        return [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": title, "emoji": True},
            }
        ]

    def __get_log_url(self, log_url: str) -> dict[str, str | dict[str, str]]:
        return {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"<{log_url}|View log link>"},
        }

    def __get_blocks(
        self,
        run_id: str,
        log_url: str,
        timestamp: str,
        message_blocks: List[dict[str, str]],
    ) -> List[Any]:
        blocks = [
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Run ID:*\n{run_id}",
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Log URL:*\n<{log_url}|View log link>",
                    },
                ],
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Start time:*\n{timestamp}",
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*AWS URL:*\n<https://ap-southeast-1.console.aws.amazon.com/ecs/v2/clusters/dp-{ENVIRONMENT}-data-onchain-ingestor/tasks?region=ap-southeast-1|View log link>",
                    },
                ],
            },
        ]

        if message_blocks:
            fields = []
            for index, message in enumerate(message_blocks):
                fields.append(
                    {
                        "type": "mrkdwn",
                        "text": f"*{message['title']}:*\n{message['value'][:2000]}",
                    }
                )
                if len(fields) == 2 or index == len(message_blocks) - 1:
                    blocks.append(
                        {
                            "type": "section",
                            "fields": fields,
                        }
                    )
                    fields = []
        return blocks

    def send_message(
        self,
        run_id: str,
        log_url: str,
        title: str,
        timestamp: str,
        status: str,
        message_blocks: Optional[List[dict[str, str]]] = None,
    ) -> None:
        """
        Send a message to Slack, if enabled.
        """
        # ✅ Early return if disabled
        if not self.enabled:
            self.logger.info(f"[SlackNotification] Disabled. Skipping message: {title}")
            return

        try:
            self.client.chat_postMessage(
                text=title,
                channel=self.__get_channel(status),
                blocks=self.__get_block_header(f"[{status}] {title}"),
                attachments=[
                    {
                        "color": self.__get_status_color(status),
                        "blocks": self.__get_blocks(
                            run_id, log_url, timestamp, message_blocks
                        ),
                    }
                ],
            )
        except SlackApiError as e:
            self.logger.warning(
                f"Error sending message to Slack: {e.response['error']}"
            )
            return None
