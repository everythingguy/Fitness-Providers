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
    value = var.S3_ACCESS_KEY
  }

  set {
    name = "secretKey"
    value = var.S3_SECRET_KEY
  }

  set {
    name = "mode"
    value = var.MINIO_REPLICA_COUNT > 1 ? "distributed" : "standalone"
  }

  set {
    name = "replicas"
    value = var.MINIO_REPLICA_COUNT
  }

  set {
    name = "persistence.storageClass"
    value = "linode-block-storage-retain"
  }

  set {
    name = "persistence.size"
    value = var.MINIO_VOLUME_SIZE
  }

  set {
    name = "resources.requests.memory"
    value = var.MINIO_RAM_SIZE
  }
}

resource "kubectl_manifest" "minio-certificate" {

    depends_on = [kubernetes_namespace.fitness, time_sleep.wait_for_clusterissuer]

    yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: minio
  namespace: fitness
spec:
  secretName: minio-cert
  issuerRef:
    name: cloudflare-prod
    kind: ClusterIssuer
  dnsNames:
  - '${var.S3_ENDPOINT}'   
    YAML
}


resource "kubernetes_ingress_v1" "minio" {

    depends_on = [kubernetes_namespace.fitness, kubectl_manifest.minio-certificate]

    metadata {
        name = "minio"
        namespace = "fitness"
    }

    spec {
        rule {

            host = var.S3_ENDPOINT

            http {

                path {
                    path = "/"

                    backend {
                        service {
                            name = "minio"
                            port {
                                number = 9000
                            }
                        }
                    }

                }
            }
        }

        tls {
          secret_name = "minio-cert"
          hosts = [var.S3_ENDPOINT]
        }
    }
}

resource "cloudflare_record" "minio" {
    depends_on = [
      data.kubernetes_service.traefik
    ]

    zone_id = var.CLOUDFLARE_ZONE_ID
    name = var.S3_ENDPOINT
    value =  data.kubernetes_service.traefik.status[0].load_balancer[0].ingress[0].ip
    type = "A"
    proxied = false
}
