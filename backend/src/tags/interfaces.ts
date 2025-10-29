import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ToLowerCaseAndTrim } from '../shared/decorators/transformers/transformers'
import { Annotation } from '../shared/entity-services/annotations/annotation.entity'

export class TagDto {
  @ApiProperty({ example: '9ae294d5-eaeb-4c58-bec9-f6b8240c8eb3' })
  id: string

  @ApiProperty({
    description: 'Name of the tag',
    example: 'Salary'
  })
  name: string

  static map(annotation: Annotation): TagDto {
    const dto = new TagDto()
    dto.id = annotation.publicId
    dto.name = annotation.name

    return dto
  }
}

export class CreateTagDto {
  @ApiProperty({
    description: 'Name of the tag',
    example: 'Salary'
  })
  @ToLowerCaseAndTrim()
  @IsNotEmpty()
  name: string
}

export class UpdateTagDto {
  @ApiProperty({
    description: 'Name of the tag',
    example: 'Salary'
  })
  @IsNotEmpty()
  name: string
}
