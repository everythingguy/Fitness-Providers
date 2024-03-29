variable "GRAFANA_DOMAIN" {
  type = string
  default = "grafana"
}

variable "GRAFANA_PASSWORD" {
  type = string
  sensitive = true
}

variable "FITNESS_REPLICA_COUNT" {
  type = number
}

variable "CLOUDFLARE_EMAIL" {
    type = string
}

variable "CLOUDFLARE_API_KEY" {
    type = string
    sensitive = true
}

variable "CLOUDFLARE_ZONE_ID" {
  type = string
}

variable "DOMAIN" {
  type = string
}

variable "REGISTRY_SERVER" {
  type = string
  default = "gitlab.com"
}

variable "REGISTRY_CONTAINER" {
  type = string
  default = "gitlab.com/fitness-providers/fitness-providers:latest"
}

variable "REGISTRY_EMAIL" {
  type = string
}

variable "REGISTRY_USERNAME" {
  type = string
}

variable "REGISTRY_PASSWORD" {
  type = string
  sensitive = true
}

variable "DEMO" {
  type = string
  default = "false"
}

variable "S3_ACCESS_KEY" {
  type = string
}

variable "S3_SECRET_KEY" {
  type = string
  sensitive = true
}

variable "MAIL_HOST" {
  type = string
  default = "smtp.mailgun.org"
}

variable "MAIL_PORT" {
  type = string
  default = "465"
}

variable "MAIL_POSTMASTER" {
  type = string
}

variable "MAIL_POSTMASTER_PASSWORD" {
  type = string
  sensitive = true
}

variable "MAIL_FROM_EMAIL" {
  type = string
}

variable "MAIL_CONTACT_EMAIL" {
  type = string
}

variable "PAYPAL_API_URL" {
  type = string
  default = "https://api-m.sandbox.paypal.com/v1"
}

variable "PAYPAL_PLAN_ID" {
  type = string
  sensitive = true
}

variable "PAYPAL_CLIENT_ID" {
  type = string
  sensitive = true
}

variable "PAYPAL_SECRET" {
  type = string
  sensitive = true
}

variable "GOOGLE_MAP_API" {
  type = string
  sensitive = true
}

variable "GOOGLE_PLACE_API" {
  type = string
  sensitive = true
}

variable "PROVIDER_TYPE" {
  type = string
  default = "fitness"
}

variable "DB_USERNAME" {
  type = string
}

variable "DB_PASSWORD" {
  type = string
  sensitive = true 
}

variable "DB_CONNECTION_STRING" {
  type = string
  sensitive = true
}

variable "SECRET" {
  type = string
  sensitive = true
}

variable "REFRESH_TOKEN_SECRET" {
  type = string
  sensitive = true
}

variable "ACCESS_TOKEN_SECRET" {
  type = string
  sensitive = true 
}

variable "S3_DASHBOARD_ENDPOINT" {
  type = string
  default = "minio"
}

variable "S3_ENDPOINT" {
  type = string
  default = "image"
}

variable "S3_BUCKET" {
  type = string
  default = "fitness"
}

variable "BASE_URL" {
  type = string
}

variable "API_URL" {
  type = string
  default = "/api/v1"
}

variable "TZ" {
  type = string
  default = "America/Detroit"
}

variable "MONGO_VOLUME_SIZE" {
  type = string
  default = "8Gi"
}

variable "MONGO_REPLICA_COUNT" {
  type = number
  default = 3
}

variable "MINIO_VOLUME_SIZE" {
  type = string
  default = "8Gi"
}

variable "MINIO_REPLICA_COUNT" {
  type = number
  default = 3
}

variable "MONGO_REPLICA_KEY" {
  type = string
  sensitive = true
}

variable "LETS_ENCRYPT_STAGING" {
  type = bool
  default = false
}