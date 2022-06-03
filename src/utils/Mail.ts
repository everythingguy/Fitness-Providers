import mailer from "nodemailer";
import ejs from "ejs";

import { User } from "../@types/models";
import { capitalize } from "./string";
import path from "path";

export default class Mail {
    static transporter = mailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10) || 587,
        secure: process.env.MAIL_PORT === "465" ? true : false,
        auth: {
            user: process.env.MAIL_POSTMASTER,
            pass: process.env.MAIL_POSTMASTER_PASSWORD
        }
    });

    private static async sendMail(
        to: string,
        subject: string,
        filename: string,
        vars: { [key: string]: any } = {},
        from: string = process.env.MAIL_FROM_EMAIL
    ): Promise<boolean> {
        // if jest test simulate the email being sent.
        // TODO:
        // eslint-disable-next-line no-constant-condition
        if (process.env.CI || process.env.NODE_ENV === "test" || true)
            return true;
        try {
            const html = await ejs.renderFile(
                path.resolve(`../Email/${filename}.ejs`),
                vars
            );
            await this.transporter.sendMail({
                from,
                to,
                subject,
                html
            });
            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`Mail Error: ${error}`);
            return false;
        }
    }

    static async passwordChange(user: User): Promise<boolean> {
        // TODO: your password has been changed email
        return await this.sendMail(
            user.email,
            `${capitalize(
                process.env.PROVIDER_TYPE
            )} Providers: Your password has been changed`,
            "User/PasswordChange",
            {}
        );
    }

    static async sendConfirmation(user: User): Promise<boolean> {
        // TODO: confirm your email
        return await this.sendMail(
            user.email,
            `${capitalize(
                process.env.PROVIDER_TYPE
            )} Providers: Confirm your email`,
            "User/EmailConfirmation",
            {}
        );
    }

    static async forgotPassword(user: User): Promise<boolean> {
        // TODO: reset password link
        // use the temporaryCode model to create the temp code for the url
        return await this.sendMail(
            user.email,
            `${capitalize(
                process.env.PROVIDER_TYPE
            )} Providers: Reset your password`,
            "User/ForgotPassword",
            {}
        );
    }
}
