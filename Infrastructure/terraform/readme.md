Since the kube config does not exist yet this deployment needs to run in two steps.

```bash
tf init -backend-config="config.http.tfbackend"
tf apply -target="module.cluster"
tf apply
tf output
```

destory: warning does not remove linode volumes for minio and mongodb.

```bash
tf destory
```

Currently mailgun needs to be setup manually.
Also the minio bucket needs to be created manually using the minio dashboard.
Make sure the bucket has a public read policy such as...

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "*"
                ]
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::fitness/*"
            ]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "*"
                ]
            },
            "Action": [
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::fitness"
            ]
        }
    ]
}
```
