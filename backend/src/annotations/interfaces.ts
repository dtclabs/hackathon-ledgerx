import { ApiProperty } from '@nestjs/swagger'
import { Annotation } from '../shared/entity-services/annotations/annotation.entity'
import { AnnotationType } from '../shared/entity-services/annotations/interfaces'

export class AnnotationDto {
  @ApiProperty({ example: '9ae294d5-eaeb-4c58-bec9-f6b8240c8eb3' })
  id: string

  @ApiProperty({ example: 'tag', enum: AnnotationType })
  type: AnnotationType

  @ApiProperty({
    description: 'Name of the tag',
    example: 'Salary'
  })
  name: string

  static map(annotation: Annotation): AnnotationDto {
    const dto = new AnnotationDto()
    dto.id = annotation.publicId
    dto.type = annotation.type
    dto.name = annotation.name

    return dto
  }
}
