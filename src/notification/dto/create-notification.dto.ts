export class CreateNotificationDto {
  recipient: string;
  message: string;
  type: string;
  status: string;
  serviceResponse?: string;
}