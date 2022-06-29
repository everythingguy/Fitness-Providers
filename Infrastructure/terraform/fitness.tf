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

                    /*env {
                        # TODO:
                    }*/

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