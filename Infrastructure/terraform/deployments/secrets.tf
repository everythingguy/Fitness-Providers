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

resource "kubernetes_secret" "fitness" {
  depends_on = [
    kubernetes_namespace.fitness
  ]

  metadata {
    name = "fitness"
    namespace = "fitness"
  }

  data = {
    S3_SECRET_KEY = var.S3_SECRET_KEY
    MAIL_POSTMASTER_PASSWORD = var.MAIL_POSTMASTER_PASSWORD
    GOOGLE_MAP_API = var.GOOGLE_MAP_API
    GOOGLE_PLACE_API = var.GOOGLE_PLACE_API
    DB_CONNECTION_STRING = var.DB_CONNECTION_STRING
    SECRET = var.SECRET
    REFRESH_TOKEN_SECRET = var.REFRESH_TOKEN_SECRET
    ACCESS_TOKEN_SECRET = var.ACCESS_TOKEN_SECRET
  }
}