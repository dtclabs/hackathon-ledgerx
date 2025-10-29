import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { LoggerService } from '../shared/logger/logger.service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { PaymentLink } from '../shared/entity-services/payment-links/payment-link.entity'
import { PaymentLinkEntityService } from '../shared/entity-services/payment-links/payment-link.entity-service'
import { CreatePaymentLinkDto, PaymentLinkDto } from './interfaces'

@Injectable()
export class PaymentLinkDomainService {
  constructor(
    private paymentLinkService: PaymentLinkEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private organizationsService: OrganizationsEntityService,
    private loggerService: LoggerService
  ) {}

  async getAll(organizationId: string): Promise<PaymentLinkDto[]> {
    const paymentLinks = await this.paymentLinkService.findAllByOrganization({
      organizationId,
      relations: ['cryptocurrency', 'organization']
    })

    return paymentLinks.map((item) => PaymentLinkDto.map(item))
  }

  async getById(param: { organizationId: string; publicId: string }): Promise<PaymentLinkDto | null> {
    const paymentLink = await this.paymentLinkService.getByOrganizationIdAndPublicId({
      publicId: param.publicId,
      organizationId: param.organizationId,
      relations: ['cryptocurrency', 'organization']
    })

    if (paymentLink) {
      return PaymentLinkDto.map(paymentLink)
    }
    return null
  }

  async create(organizationId: string, createPaymentLinkDto: CreatePaymentLinkDto): Promise<PaymentLinkDto> {
    const { organization, cryptocurrency } = await this.validateBeforeCreation(organizationId, createPaymentLinkDto)

    try {
      const paymentLink = PaymentLink.create({
        organization: organization,
        cryptocurrency: cryptocurrency,
        blockchainId: createPaymentLinkDto.blockchainId,
        address: createPaymentLinkDto.address
      })

      const createdPaymentLink = await this.paymentLinkService.create(paymentLink)
      return PaymentLinkDto.map(createdPaymentLink)
    } catch (error) {
      this.loggerService.error('Error while creating payment link', error, {
        organizationId,
        createPaymentLinkDto
      })
      throw error
    }
  }

  private async validateBeforeCreation(organizationId: string, createPaymentLinkDto: CreatePaymentLinkDto) {
    const organization = await this.organizationsService.get(organizationId)
    if (!organization) {
      throw new NotFoundException('Organization not found')
    }

    const cryptocurrency = await this.cryptocurrenciesService.getBySymbol(createPaymentLinkDto.cryptocurrency)
    if (!cryptocurrency) {
      throw new NotFoundException('Cryptocurrency not found')
    }

    const existingPaymentLink = await this.paymentLinkService.getByAddressTokenChain({
      address: createPaymentLinkDto.address,
      cryptocurrencyId: cryptocurrency.id,
      blockchainId: createPaymentLinkDto.blockchainId,
      organizationId: organization.id
    })

    if (existingPaymentLink) {
      throw new BadRequestException('Payment Link already exists')
    }
    return { organization, cryptocurrency }
  }

  async delete(organizationId: string, publicId: string) {
    const paymentLink = await this.paymentLinkService.getByOrganizationIdAndPublicId({
      publicId,
      organizationId
    })

    if (!paymentLink) {
      throw new NotFoundException('Payment Link not found')
    }

    try {
      await this.paymentLinkService.softDelete(paymentLink.id)
    } catch (e) {
      this.loggerService.error('Error while deleting payment link', e, {
        organizationId,
        publicId
      })
      throw e
    }
  }
}
