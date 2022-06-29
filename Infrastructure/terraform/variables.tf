variable "LINODE_TOKEN" {
  type = string
  sensitive = true
}

variable "KUBE_CONFIG_PATH" {
  type = string
}

variable "EMAIL" {
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
}

variable "REGISTRY_USERNAME" {
  type = string
}

variable "REGISTRY_PASSWORD" {
  type = string
  sensitive = true
}

variable "MINIO_ACCESS_KEY" {
  type = string
}

variable "MINIO_SECRET_KEY" {
  type = string
  sensitive = true
}

variable "MONGO_USERNAME" {
  type = string
}

variable "MONGO_PASSWORD" {
  type = string
  sensitive = true
}