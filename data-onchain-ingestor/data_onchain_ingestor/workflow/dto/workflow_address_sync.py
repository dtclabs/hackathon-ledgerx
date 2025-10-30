from pydantic import BaseModel


class WorkflowAddressSync(BaseModel):
    """
    Model that contains information to trigger address workflow
    """

    address: str
