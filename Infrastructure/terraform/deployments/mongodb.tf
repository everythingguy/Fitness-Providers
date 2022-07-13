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
    name = "auth.rootUser"
    value = var.DB_USERNAME
  }

  set_sensitive {
    name = "auth.rootPassword"
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