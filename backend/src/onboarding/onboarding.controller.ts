import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { OnboardingService } from './onboarding.controller.service'
import { OnboardingStepDto, OnboardingDto, RegisterOwnerAddressDto, SubmitReferenceIdDto } from './interfaces'

@ApiTags('onboardings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('card/onboarding-steps')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: OnboardingDto })
  async getAllCardOnboardingSteps(@OrganizationId() organizationId: string): Promise<OnboardingDto> {
    return await this.onboardingService.getAllCardOnboardingSteps(organizationId)
  }

  @Post('card/onboarding-steps/know-your-business/initiate')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: OnboardingStepDto })
  async initiateKYB(@OrganizationId() organizationId: string): Promise<OnboardingStepDto> {
    return await this.onboardingService.initiateKYB(organizationId)
  }

  @Post('card/onboarding-steps/owner-address/register')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: OnboardingStepDto })
  async registerOwnerAddress(
    @OrganizationId() organizationId: string,
    @Body() registerOwnerAddressDto: RegisterOwnerAddressDto
  ): Promise<OnboardingStepDto> {
    return await this.onboardingService.registerOwnerAddress(
      organizationId,
      registerOwnerAddressDto.blockchainId,
      registerOwnerAddressDto.walletAddress
    )
  }

  @Post('card/onboarding-steps/know-your-business/submit')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: OnboardingStepDto })
  async submitBlockPassReferenceId(
    @OrganizationId() organizationId: string,
    @Body() submitReferenceIdDto: SubmitReferenceIdDto
  ): Promise<OnboardingStepDto> {
    return await this.onboardingService.submitBlockPassReferenceId(organizationId, submitReferenceIdDto.referenceId)
  }
}
