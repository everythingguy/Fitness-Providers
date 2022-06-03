import mailer from "nodemailer";
import ejs from "ejs";

import { User } from "../@types/models";
import { capitalize } from "./string";
import path from "path";
import { v4 as uuid } from "uuid";
import PasswordResetCode from "../models/passwordResetCode";
import EmailConfirmationCode from "../models/emailConfirmationCode";

// TODO: send email function that only works if the email is confirmed

export default class Mail {
    static transporter = mailer.createTransport({
        host: process.env.MAIL_HOST,
        port: isNaN(parseInt(process.env.MAIL_PORT, 10))
            ? 587
            : parseInt(process.env.MAIL_PORT, 10),
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
        if (process.env.CI || process.env.NODE_ENV === "test") return true;
        try {
            const html = await ejs.renderFile(
                path.resolve(`src/Email/${filename}.ejs`),
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
        return await this.sendMail(
            user.email,
            `${capitalize(
                process.env.PROVIDER_TYPE
            )} Providers: Your password has been changed`,
            "Base",
            {
                page: "User/PasswordChange",
                PROVIDER_TYPE: capitalize(process.env.PROVIDER_TYPE),
                MAIL_CONTACT_EMAIL: process.env.MAIL_CONTACT_EMAIL,
                passwordResetURL: `${process.env.BASE_URL}/user/password/forgot`
            }
        );
    }

    static async sendConfirmation(user: User): Promise<boolean> {
        const code = new EmailConfirmationCode({
            user: user._id,
            code: uuid()
        });

        await code.save();

        return await this.sendMail(
            user.email,
            `${capitalize(
                process.env.PROVIDER_TYPE
            )} Providers: Confirm your email`,
            "Base",
            {
                page: "User/EmailConfirmation",
                PROVIDER_TYPE: capitalize(process.env.PROVIDER_TYPE),
                MAIL_CONTACT_EMAIL: process.env.MAIL_CONTACT_EMAIL,
                confirmEmailURL: `${process.env.BASE_URL}/user/email/confirmation?code=${code.code}`
            }
        );
    }

    static async forgotPassword(user: User): Promise<boolean> {
        const code = new PasswordResetCode({
            user: user._id,
            code: uuid()
        });

        await code.save();

        return await this.sendMail(
            user.email,
            `${capitalize(
                process.env.PROVIDER_TYPE
            )} Providers: Reset your password`,
            "Base",
            {
                page: "User/ForgotPassword",
                PROVIDER_TYPE: capitalize(process.env.PROVIDER_TYPE),
                MAIL_CONTACT_EMAIL: process.env.MAIL_CONTACT_EMAIL,
                passwordResetURL: `${process.env.BASE_URL}/user/password/reset?code=${code.code}`
            }
        );
    }
}
