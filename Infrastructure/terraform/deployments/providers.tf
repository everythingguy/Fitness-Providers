terraform {
  required_providers {
    linode = {
      source  = "linode/linode"
    }

    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.20.0"
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
      version = "4.4.0"
    }
  }
}