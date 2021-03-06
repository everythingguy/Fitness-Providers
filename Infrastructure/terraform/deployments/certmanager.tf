resource "kubernetes_namespace" "certmanager" {
    metadata {
      name = "cert-manager"
    }
}

resource "helm_release" "certmanager" {
  depends_on = [
    kubernetes_namespace.certmanager
  ]

  name = "cert-manager"
  namespace = "cert-manager"

  repository = "https://charts.jetstack.io"
  chart = "cert-manager"

  set {
    name = "installCRDs"
    value = "true"
  }
}

resource "time_sleep" "wait_for_certmanager" {

    depends_on = [
        helm_release.certmanager
    ]

    create_duration = "30s"
}

resource "kubectl_manifest" "cloudflare_prod" {

    depends_on = [
        time_sleep.wait_for_certmanager,
        kubernetes_secret.cloudflare_api_key_secret
    ]

    yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: cloudflare-prod
spec:
  acme:
    email: ${var.CLOUDFLARE_EMAIL}
    server: ${var.LETS_ENCRYPT_STAGING == true ? "https://acme-staging-v02.api.letsencrypt.org/directory" : "https://acme-v02.api.letsencrypt.org/directory"}
    privateKeySecretRef:
      name: cloudflare-prod-account-key
    solvers:
    - dns01:
        cloudflare:
          email: ${var.CLOUDFLARE_EMAIL}
          apiKeySecretRef:
            name: cloudflare-api-key-secret
            key: api-key
    YAML
}

resource "time_sleep" "wait_for_clusterissuer" {

    depends_on = [
        kubectl_manifest.cloudflare_prod
    ]

    create_duration = "30s"
}