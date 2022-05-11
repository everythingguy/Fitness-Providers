import { User } from "../@types/models";
import mailer from "nodemailer";
import { capitalize } from "./string";

export default class Mail {
  static transporter = mailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_PORT === "465" ? true : false,
    auth: {
      user: process.env.MAIL_POSTMASTER,
      pass: process.env.MAIL_POSTMASTER_PASSWORD,
    },
  });

  private static async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    from: string = process.env.MAIL_FROM_EMAIL
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async sendConfirmation(user: User): Promise<boolean> {
    // TODO:
    return this.sendMail(
      user.email,
      `${capitalize(process.env.PROVIDER_TYPE)} Providers: Confirm your email`,
      "",
      ""
    );
  }

  static async forgotPassword(user: User): Promise<boolean> {
    // TODO:
    // use the temporaryCode model to create the temp code for the url
    return this.sendMail(
      user.email,
      `${capitalize(process.env.PROVIDER_TYPE)} Providers: Reset your password`,
      "",
      ""
    );
  }
}
