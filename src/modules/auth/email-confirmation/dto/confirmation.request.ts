import { IsNotEmpty, IsString } from 'class-validator'

export class ConfirmationRequest {
  @IsString()
  @IsNotEmpty()
  token: string
}
