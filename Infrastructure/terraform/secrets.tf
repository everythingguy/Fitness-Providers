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