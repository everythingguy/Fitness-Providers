resource "helm_release" "minio" {
  depends_on = [
    kubernetes_namespace.fitness
  ]

  name = "minio"
  namespace = "fitness"

  repository = "https://helm.min.io/"
  chart = "minio"

  set {
    name = "accessKey"
    value = var.MINIO_ACCESS_KEY
  }

  set {
    name = "secretKey"
    value = var.MINIO_SECRET_KEY
  }

  set {
    name = "mode"
    value = "distributed"
  }

  set {
    name = "replicas"
    value = 3
  }
}