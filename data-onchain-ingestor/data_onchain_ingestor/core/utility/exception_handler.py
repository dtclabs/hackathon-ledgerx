import functools
from typing import Any, Callable, TypeVar, Union, cast

from redis.exceptions import RedisError
from sqlalchemy.exc import SQLAlchemyError

from data_onchain_ingestor.config.config import get_logger


class DatabaseCacheError(SQLAlchemyError, RedisError):
    def __init__(self, original_exception: Union[SQLAlchemyError, RedisError]) -> None:
        self.original_exception = original_exception
        super().__init__(str(original_exception))

    def __str__(self) -> str:
        if isinstance(self.original_exception, SQLAlchemyError):
            return f"SQLAlchemyError occurred: {self.original_exception}"
        elif isinstance(self.original_exception, RedisError):
            return f"RedisError occurred: {self.original_exception}"
        else:
            return f"Unknown database error occurred: {self.original_exception}"


# Define a generic type variable
T = TypeVar("T", bound=Callable[..., Any])
logger = get_logger()


def handle_exception(message: str) -> Callable[[T], T]:
    def decorator(func: T) -> T:
        """
        Decorator to handle SQLAlchemy exceptions.

        :param func: The function to be wrapped by the decorator.
        :return: The wrapped function which includes exception handling for SQLAlchemy errors.
        """

        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            """
            Wrapper function to handle exceptions during the execution of the decorated function.

            :param args: Positional arguments passed to the decorated function.
            :param kwargs: Keyword arguments passed to the decorated function.
            :return: The result of the decorated function if no exception occurs.
            :raises: The original exception if an error occurs during the execution of the decorated function.
            """
            try:
                return func(*args, **kwargs)
            except DatabaseCacheError as databaseCacheError:
                logger.error("[DatabaseCacheError] %s: %s", message, databaseCacheError)
                raise databaseCacheError
            except ValueError as valueError:
                # Log and re-raise ValueError exceptions
                logger.error("[valueError] %s: %s", message, valueError)
                raise valueError

        return cast(T, wrapper)

    return decorator
