terraform {
  backend "http" {}
  required_providers {
    linode = {
      source  = "linode/linode"
    }

    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.12.1"
    }

    kubectl = {
      source = "gavinbunney/kubectl"
      version = "1.14.0"
    }

    helm = {
      source = "hashicorp/helm"
      version = "2.6.0"
    }

    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "3.19.0"
    }
  }
}

provider "linode" {
  token = var.LINODE_TOKEN
}

provider "kubernetes" {
  config_path = var.KUBE_CONFIG_PATH
}

provider "kubectl" {
  config_path = var.KUBE_CONFIG_PATH
}

provider "helm" {
   kubernetes {
    config_path = var.KUBE_CONFIG_PATH
  }
}

provider "cloudflare" {
    email = var.CLOUDFLARE_EMAIL
    api_key = var.CLOUDFLARE_API_KEY
}