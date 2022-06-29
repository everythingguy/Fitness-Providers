resource "kubernetes_namespace" "traefik" {
    depends_on = [
      time_sleep.wait_for_kubernetes
    ]
    
    metadata {
      name = "traefik"
    }
}

resource "helm_release" "traefik" {
  depends_on = [
    kubernetes_namespace.traefik
  ]

  name = "traefik"
  namespace = "traefik"

  repository = "https://helm.traefik.io/traefik"
  chart = "traefik"

  set {
    name = "ingressClass.enabled"
    value = "true"
  }

  set {
    name = "ingressClass.isDefaultClass"
    value = "true"
  }

  set {
    name = "ports.web.redirectTo"
    value = "websecure"
  }

  set {
    name = "ports.websecure.tls.enabled"
    value = "true"
  }
}

output "test" {
  value = helm_release.traefik
  sensitive = true
}