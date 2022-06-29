resource "kubernetes_secret" "cloudflare_api_key_secret" {

    depends_on = [
        kubernetes_namespace.certmanager
    ]

    metadata {
        name = "cloudflare-api-key-secret"
        namespace = "certmanager"
    }

    data = {
        api-key = var.CLOUDFLARE_API_KEY
    }

    type = "Opaque"
}

resource "kubernetes_secret" "gitlab-registry" {
  depends_on = [
    kubernetes_namespace.fitness
  ]

  metadata {
    name = "gitlab-registry"
    namespace = "fitness"
  }

  type = "kubernetes.io/dockerconfigjson"

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "${var.REGISTRY_SERVER}" = {
          "username" = var.REGISTRY_USERNAME
          "password" = var.REGISTRY_PASSWORD
          "auth"     = base64encode("${var.REGISTRY_USERNAME}:${var.REGISTRY_PASSWORD}")
        }
      }
    })
  }
}