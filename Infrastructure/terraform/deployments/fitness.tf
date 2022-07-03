resource "kubernetes_namespace" "fitness" {
    metadata {
      name = "fitness"
    }
}

resource "kubernetes_deployment" "fitness" {

    depends_on = [
        helm_release.mongodb,
        helm_release.minio,
        kubernetes_secret.gitlab-registry,
        kubernetes_secret.fitness
    ]

    metadata {
        name = "fitness"
        namespace = "fitness"
        labels = {
            app = "fitness"
        }
    }

    spec {
        replicas = var.FITNESS_REPLICA_COUNT

        selector {
            match_labels = {
                app = "fitness"
            }
        }

        template {
            metadata {
                labels = {
                    app = "fitness"
                }
            }

            spec {
                container {
                    image = var.REGISTRY_CONTAINER
                    name  = "fitness"

                    port {
                        container_port = 80
                    }

                    env {
                        name = "DOMAIN"
                        value = var.DOMAIN
                    }

                    env {
                        name = "S3_ACCESS_KEY"
                        value = var.S3_ACCESS_KEY
                    }

                    env {
                        name = "S3_SECRET_KEY"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "S3_SECRET_KEY"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "MAIL_HOST"
                        value = var.MAIL_HOST
                    }

                    env {
                        name = "MAIL_PORT"
                        value = var.MAIL_PORT
                    }

                    env {
                        name = "MAIL_POSTMASTER"
                        value = var.MAIL_POSTMASTER
                    }

                    env {
                        name = "MAIL_POSTMASTER_PASSWORD"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "MAIL_POSTMASTER_PASSWORD"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "MAIL_FROM_EMAIL"
                        value = var.MAIL_FROM_EMAIL
                    }

                    env {
                        name = "MAIL_CONTACT_EMAIL"
                        value = var.MAIL_CONTACT_EMAIL
                    }

                    env {
                        name = "GOOGLE_MAP_API"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "GOOGLE_MAP_API"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "GOOGLE_PLACE_API"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "GOOGLE_PLACE_API"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "PROVIDER_TYPE"
                        value = var.PROVIDER_TYPE
                    }

                    env {
                        name = "DB_CONNECTION_STRING"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "DB_CONNECTION_STRING"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "SECRET"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "SECRET"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "REFRESH_TOKEN_SECRET"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "REFRESH_TOKEN_SECRET"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "ACCESS_TOKEN_SECRET"

                        value_from {
                          secret_key_ref {
                            name = "fitness"
                            key = "ACCESS_TOKEN_SECRET"
                            optional = false
                          }
                        }
                    }

                    env {
                        name = "S3_ENDPOINT"
                        value = "https://${var.S3_ENDPOINT}"
                    }

                    env {
                        name = "S3_BUCKET"
                        value = var.S3_BUCKET
                    }

                    env {
                        name = "BASE_URL"
                        value = var.BASE_URL
                    }

                    env {
                        name = "API_URL"
                        value = var.API_URL
                    }

                    env {
                        name = "TZ"
                        value = var.TZ
                    }

                    liveness_probe {
                      initial_delay_seconds = 30
                      period_seconds = 30
                      http_get {
                        port = 80
                        path = "/api/v1/health" 
                      }
                    }
                }

                image_pull_secrets {
                    name = "gitlab-registry"
                }
            }
        }
    }
}


resource "kubernetes_service" "fitness" {

    depends_on = [
        kubernetes_namespace.fitness
    ]

    metadata {
        name = "fitness"
        namespace = "fitness"
    }
    spec {
        selector = {
            app = "fitness"
        }
        port {
            port = 80
        }

        type = "ClusterIP"
    }
}


resource "kubectl_manifest" "fitness-certificate" {

    depends_on = [kubernetes_namespace.fitness, time_sleep.wait_for_clusterissuer]

    yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: fitness
  namespace: fitness
spec:
  secretName: fitness
  issuerRef:
    name: cloudflare-prod
    kind: ClusterIssuer
  dnsNames:
  - '${var.DOMAIN}'   
    YAML
}


resource "kubernetes_ingress_v1" "fitness" {

    depends_on = [kubernetes_namespace.fitness]

    metadata {
        name = "fitness"
        namespace = "fitness"
    }

    spec {
        rule {

            host = var.DOMAIN

            http {

                path {
                    path = "/"

                    backend {
                        service {
                            name = "fitness"
                            port {
                                number = 80
                            }
                        }
                    }

                }
            }
        }

        tls {
          secret_name = "fitness"
          hosts = [var.DOMAIN]
        }
    }
}

resource "cloudflare_record" "fitness" {
    depends_on = [
      data.traefik
    ]

    zone_id = var.CLOUDFLARE_ZONE_ID
    name = var.DOMAIN
    value =  data.traefik.spec.external_ips[0]
    type = "A"
    proxied = false
}