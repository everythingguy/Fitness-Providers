terraform {
  required_providers {
    linode = {
      source  = "linode/linode"
    }

    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.18.1"
    }

    kubectl = {
      source = "gavinbunney/kubectl"
      version = "1.14.0"
    }

    helm = {
      source = "hashicorp/helm"
      version = "2.9.0"
    }

    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "4.0.0"
    }
  }
}