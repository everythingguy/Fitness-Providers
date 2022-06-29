resource "helm_release" "mongodb" {
  depends_on = [
    kubernetes_namespace.fitness
  ]

  name = "mongodb"
  namespace = "fitness"

  repository = "https://charts.bitnami.com/bitnami"
  chart = "mongodb"

  set {
    name = "architecture"
    value = "replicaset"
  }

  set {
    name = "replicaCount"
    value = 3
  }

  set {
    name = "auth.usernames[0]"
    value = var.DB_USERNAME
  }

  set {
    name = "auth.passwords[0]"
    value = var.DB_PASSWORD
  }
}