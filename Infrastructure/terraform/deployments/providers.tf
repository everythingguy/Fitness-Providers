terraform {
  required_providers {
    linode = {
      source  = "linode/linode"
    }

    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.16.1"
    }

    kubectl = {
      source = "gavinbunney/kubectl"
      version = "1.14.0"
    }

    helm = {
      source = "hashicorp/helm"
      version = "2.8.0"
    }

    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "3.31.0"
    }
  }
}