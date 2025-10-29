import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { CountryDto } from './interfaces'
import { CountriesEntityService } from '../shared/entity-services/countries/countries.entity-service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('countries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CountriesController {
  constructor(private countriesService: CountriesEntityService) {}

  @Get()
  @ApiOkResponse({ type: [CountryDto] })
  async getList() {
    const countries = await this.countriesService.find({
      order: {
        name: 'ASC'
      }
    })
    return countries.map((country) => CountryDto.map(country))
  }
}
