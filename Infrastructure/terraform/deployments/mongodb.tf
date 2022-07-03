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
    value = var.MONGO_REPLICA_COUNT
  }

  set {
    name = "auth.databases[0]"
    value = "admin"
  }

  set {
    name = "auth.usernames[0]"
    value = var.DB_USERNAME
  }

  set {
    name = "auth.passwords[0]"
    value = var.DB_PASSWORD
  }

  set {
    name = "persistence.storageClass"
    value = "linode-block-storage-retain"
  }

  set {
    name = "persistence.size"
    value = var.MONGO_VOLUME_SIZE
  }
}