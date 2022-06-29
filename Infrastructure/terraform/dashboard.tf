resource "kubernetes_namespace" "kubernetes-dashboard" {
  depends_on = [
    time_sleep.wait_for_kubernetes
  ]
    
  metadata {
    name = "kubernetes-dashboard"
  }
}

resource "helm_release" "kubernetes-dashboard" {
  depends_on = [
    kubernetes_namespace.kubernetes-dashboard
  ]

  name = "kubernetes-dashboard"
  namespace = "kubernetes-dashboard"

  repository = "https://kubernetes.github.io/dashboard/"
  chart = "kubernetes-dashboard"

  set {
    name = "service.externalPort"
    value = "8080"
  }
}