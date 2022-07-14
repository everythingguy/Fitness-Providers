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

  set_sensitive {
    name = "auth.replicaSetKey"
    value = var.MONGO_REPLICA_KEY
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

resource "helm_release" "mongodb-metrics" {
  depends_on = [
    helm_release.prometheus,
    helm_release.mongodb
  ]

  name = "mongodb-metrics"
  namespace = "fitness"

  repository = "https://prometheus-community.github.io/helm-charts"
  chart = "prometheus-mongodb-exporter"

  set {
    name = "serviceMonitor.enabled"
    value = "true"
  }

  set {
    name = "serviceMonitor.namespace"
    value = "prometheus"
  }

  set {
    name = "serviceMonitor.additionalLabels.release"
    value = "prometheus"
  }

  set {
    name = "extraArgs[0]"
    value = "--collect-all"
  }

  set {
    name = "extraArgs[1]"
    value = "--compatible-mode"
  }

  set_sensitive {
    name = "mongodb.uri"
    value = "mongodb://${var.DB_USERNAME}:${var.DB_PASSWORD}@mongodb-0.mongodb-headless.fitness.svc.cluster.local:27017/admin"
  }
}