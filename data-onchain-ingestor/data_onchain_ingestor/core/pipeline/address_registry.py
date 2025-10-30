from typing import List, Optional

import polars as pl

from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.core.utility.hash import generate_hash
from data_onchain_ingestor.dto.address_registry import (
    AddressRegistry as AddressRegistryDTO,
)
from data_onchain_ingestor.dto.job_registry import JobRegistry as JobRegistryDTO

from .address_status import AddressStatus


class AddressRegistry:
    def __init__(self, chain_id: str, persistent: Persistent):
        """
        Initialize the AddressRegistry instance with a chain ID and a persistent storage handler.

        :param chain_id: Blockchain chain identifier.
        :param persistent: Persistent storage handler instance.
        """
        self.chain_id = chain_id
        self.persistent = persistent

    def update(
        self, addresses: List[str], status: AddressStatus, mode: str = "upsert"
    ) -> None:
        """
        Update the status of given addresses in the address registry.

        :param addresses: List of addresses to update.
        :param status: New status to set for the addresses.
        """
        data = self.__get_registered_address_data_frame(addresses, status)
        return self.persistent.write(
            data,
            AddressRegistryDTO.table_name(),
            mode,
            unique_keys=AddressRegistryDTO.on_conflict_fields(),
        )

    def register(self, addresses: List[str]) -> None:
        """
        Register new addresses with the status RESERVED.

        :param addresses: List of addresses to register.
        """
        self.update(addresses, AddressStatus.COMPLETED, "upsert-do-nothing")

    def register_job(self, address: str, run_id: str, status: AddressStatus) -> None:
        """
        :param address: Address associated with the job.
        :param run_id: Job run identifier.
        """
        data = pl.DataFrame(
            [
                {
                    "run_id": run_id,
                    "chain_id": self.chain_id,
                    "indexed_address": address,
                    "status": status.value,
                }
            ]
        )
        self.persistent.write(
            data,
            JobRegistryDTO.table_name(),
            "upsert",
            unique_keys=JobRegistryDTO.on_conflict_fields(),
        )

    def force_resync(self, addresses: List[str]) -> None:
        """
        Force resync for the given addresses.

        :param addresses: List of addresses to force resync.
        """
        self.update(addresses, AddressStatus.RESERVED, "upsert")

    def fetch_eligible_addresses(self, index_address: Optional[str] = None) -> List[str]:
        """
        Fetch eligible addresses based on the sync mode.

        :return: List of eligible addresses.
        """
        query = (
            f"SELECT indexed_address FROM {self.persistent.schema}.{AddressRegistryDTO.table_name()} "
            f"WHERE CHAIN_ID = '{self.chain_id}'"
        )

        if index_address:
            query += f" AND indexed_address = '{index_address}'"

        addresses: List[str] = []
        for row in self.persistent.execute(query):
            addresses.append(row[0])

        return addresses

    def __get_registered_address_data_frame(
        self, addresses: List[str], status: AddressStatus
    ) -> pl.DataFrame:
        """
        Create a DataFrame for the given addresses and status.

        :param addresses: List of addresses to include in the DataFrame.
        :param status: Status to set for all addresses.
        :return: Polars DataFrame containing the address data.
        """
        result = []
        for address in addresses:
            result.append(
                {
                    "register_id": generate_hash(self.chain_id, address),
                    "chain_id": self.chain_id,
                    "indexed_address": address,
                    "status": status.value,
                    "is_scheduled": False
                }
            )

        return pl.DataFrame(result)
