import { Body, Controller, NotFoundException, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthorizationDto, AuthorizationResponseDto, LoginAuthDto, SignUpAuthDto } from './interfaces'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() authDto: LoginAuthDto) {
    const authResult = await this.authService.login(authDto)
    if (!authResult) {
      throw new NotFoundException('Account does not exist')
    }
    return authResult
  }

  @Post('authorize')
  async authorize(@Body() authDto: AuthorizationDto): Promise<AuthorizationResponseDto> {
    const authResult = await this.authService.authorize(authDto)
    if (!authResult) {
      throw new NotFoundException('Account does not exist')
    }
    return authResult
  }

  @Post('sign-up')
  async signUp(@Body() signUpAuthDto: SignUpAuthDto) {
    const authResult = await this.authService.signUp(signUpAuthDto)
    if (!authResult) {
      throw new NotFoundException('Account does not exist')
    }
    return authResult
  }
}
