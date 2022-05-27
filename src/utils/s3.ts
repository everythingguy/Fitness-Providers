import express from "express";
import AWS from "aws-sdk";
import mongoose from "mongoose";
import multer from "multer";
import { Image as ImageModel } from "../@types/models";

const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT,
    s3ForcePathStyle: true,
    signatureVersion: "v4"
});

function fileFilter(
    req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png"
    )
        cb(null, true);
    else cb(null, false);
}

export const upload = multer({ storage: multer.memoryStorage(), fileFilter });

export function uploadImageHandler<T extends ImageModel>(
    model:
        | mongoose.Model<T>
        | mongoose.PaginateModel<T>
        | mongoose.AggregatePaginateModel<T>,
    modelName: string
) {
    return async (req: express.Request, res: express.Response) => {
        if (req.file === undefined)
            return res.status(400).json({
                success: false,
                error: {
                    image: "Missing or invalid image, jpg and png supported"
                }
            });

        let obj: mongoose.HydratedDocument<T>;
        try {
            obj = await model.findById(req.params.id);
            if (!obj)
                throw new Error(`${modelName} (${req.params.id}) not found`);
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: `${modelName} (${req.params.id}) not found`
            });
        }

        s3.upload(
            {
                Bucket: process.env.S3_BUCKET,
                Key:
                    req.file.mimetype === "image/png"
                        ? `${modelName}/image/${obj._id}.png`
                        : `${modelName}/image/${obj._id}.jpg`,
                Body: req.file.buffer,
                ACL: "public-read",
                ContentType:
                    req.file.mimetype === "image/png"
                        ? "image/png"
                        : "image/jpeg"
            },
            async (error: Error, data: AWS.S3.ManagedUpload.SendData) => {
                if (error) {
                    // eslint-disable-next-line no-console
                    console.log(error);
                    return res.status(500).json({
                        success: false,
                        error: "Server Error"
                    });
                }

                obj.image = data.Location;

                await obj.save();

                res.status(200).json({
                    success: true,
                    data: {
                        image: obj.image
                    }
                });
            }
        );
    };
}

function removeFile(modelName: string, filename: string) {
    return new Promise<void>((res) => {
        s3.deleteObject(
            {
                Bucket: process.env.S3_BUCKET,
                Key: `${modelName}/image/${filename}`
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (error: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => {
                // eslint-disable-next-line no-console
                if (error) console.log(error);
                res();
            }
        );
    });
}

export function fileRemover(modelName: string, postHook = false) {
    return function (
        this: any,
        next: mongoose.CallbackWithoutResultAndOptionalError
    ) {
        if (postHook) {
            if (this.image) {
                const split = this.image.split("/");
                const filename = split[split.length - 1];

                removeFile(modelName, filename);
            }
            next();
        } else {
            if ("image" in this._update) {
                this.model
                    .findById(this._conditions._id)
                    .then((prevDoc: any) => {
                        if (prevDoc.image) {
                            const split = prevDoc.image.split("/");
                            const filename = split[split.length - 1];

                            removeFile(modelName, filename).then(() => next());
                        } else next();
                    });
            } else next();
        }
    };
}
