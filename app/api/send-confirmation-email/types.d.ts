declare module "resend" {
  export interface EmailResponse {
    data?: {
      id: string
    }
    error?: {
      message: string
    }
  }

  export interface SendEmailOptions {
    from: string
    to: string | string[]
    cc?: string | string[]
    subject: string
    html: string
  }

  export class Resend {
    constructor(apiKey: string)
    emails: {
      send(options: SendEmailOptions): Promise<EmailResponse>
    }
  }
}
