resource "helm_release" "minio" {
  depends_on = [
    kubernetes_namespace.fitness
  ]

  name = "minio"
  namespace = "fitness"

  repository = "https://charts.bitnami.com/bitnami"
  chart = "minio"

  set {
    name = "auth.rootUser"
    value = var.S3_ACCESS_KEY
  }

  set_sensitive {
    name = "auth.rootPassword"
    value = var.S3_SECRET_KEY
  }

  set {
    name = "mode"
    value = var.MINIO_REPLICA_COUNT > 1 ? "distributed" : "standalone"
  }

  set {
    name = "statefulset.replicaCount"
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
    name = "extraEnvVars"
    value = <<YAML
- name: MINIO_SERVER_URL
  value: "https://${var.S3_ENDPOINT}/"
- name: MINIO_BROWSER_REDIRECT_URL
  value: "https://${var.S3_DASHBOARD_ENDPOINT}/"
    YAML
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


resource "kubernetes_ingress_v1" "minio-dashboard" {

    depends_on = [kubernetes_namespace.fitness, kubectl_manifest.minio-certificate]

    metadata {
        name = "minio-dashboard"
        namespace = "fitness"
    }

    spec {
        rule {

            host = var.S3_DASHBOARD_ENDPOINT

            http {

                path {
                    path = "/"

                    backend {
                        service {
                            name = "minio"
                            port {
                                number = 9001
                            }
                        }
                    }

                }
            }
        }

        tls {
          secret_name = "minio-cert"
          hosts = [var.S3_DASHBOARD_ENDPOINT]
        }
    }
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

resource "cloudflare_record" "minio-dashboard" {
    depends_on = [
      data.kubernetes_service.traefik
    ]

    zone_id = var.CLOUDFLARE_ZONE_ID
    name = var.S3_DASHBOARD_ENDPOINT
    value =  data.kubernetes_service.traefik.status[0].load_balancer[0].ingress[0].ip
    type = "A"
    proxied = false
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
