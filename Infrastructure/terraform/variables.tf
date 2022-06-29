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