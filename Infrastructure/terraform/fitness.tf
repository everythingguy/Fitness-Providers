resource "kubernetes_namespace" "fitness" {
    depends_on = [
      time_sleep.wait_for_kubernetes
    ]
    
    metadata {
      name = "fitness"
    }
}

resource "kubernetes_deployment" "fitness" {

    depends_on = [
        helm_release.mongodb,
        helm_release.minio,
        kubernetes_secret.gitlab-registry
    ]

    metadata {
        name = "fitness"
        namespace = "fitness"
        labels = {
            app = "fitness"
        }
    }

    spec {
        replicas = 3

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
                    image = "gitlab.duraken.com:5050/fitness-providers/fitness-providers:latest"
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
                        value = var.S3_SECRET_KEY
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
                        value = var.MAIL_POSTMASTER_PASSWORD
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
                        value = var.GOOGLE_MAP_API
                    }

                    env {
                        name = "GOOGLE_PLACE_API"
                        value = var.GOOGLE_PLACE_API
                    }

                    env {
                        name = "PROVIDER_TYPE"
                        value = var.PROVIDER_TYPE
                    }

                    env {
                        name = "DB_USERNAME"
                        value = var.DB_USERNAME
                    }

                    env {
                        name = "DB_PASSWORD"
                        value = var.DB_PASSWORD
                    }

                    env {
                        name = "DB_AUTHSOURCE"
                        value = var.DB_AUTHSOURCE
                    }

                    env {
                        name = "DB_IP"
                        value = var.DB_IP
                    }

                    env {
                        name = "DB_PORT"
                        value = var.DB_PORT
                    }

                    env {
                        name = "DB_NAME"
                        value = var.DB_NAME
                    }

                    env {
                        name = "SECRET"
                        value = var.SECRET
                    }

                    env {
                        name = "REFRESH_TOKEN_SECRET"
                        value = var.REFRESH_TOKEN_SECRET
                    }

                    env {
                        name = "ACCESS_TOKEN_SECRET"
                        value = var.ACCESS_TOKEN_SECRET
                    }

                    env {
                        name = "S3_ENDPOINT"
                        value = var.S3_ENDPOINT
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

/* resource "cloudflare_record" "clcreative-main-cluster" {
    zone_id = var.CLOUDFLARE_ZONE_ID
    name = var.DOMAIN
    value =  data.civo_loadbalancer.traefik_lb.public_ip # TODO:
    type = "A"
    proxied = false
} */