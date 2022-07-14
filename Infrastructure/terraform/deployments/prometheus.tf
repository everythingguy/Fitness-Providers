resource "kubernetes_namespace" "prometheus" {
    metadata {
      name = "prometheus"
    }
}

resource "helm_release" "prometheus" {
  depends_on = [
    kubernetes_namespace.prometheus
  ]

  name = "prometheus"
  namespace = "prometheus"

  repository = "https://prometheus-community.github.io/helm-charts"
  chart = "kube-prometheus-stack"

  set_sensitive {
    name = "grafana.adminPassword"
    value = var.GRAFANA_PASSWORD
  }
}

resource "kubectl_manifest" "grafana-certificate" {

    depends_on = [kubernetes_namespace.prometheus, time_sleep.wait_for_clusterissuer]

    yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: prometheus-grafana
  namespace: prometheus
spec:
  secretName: grafana-cert
  issuerRef:
    name: cloudflare-prod
    kind: ClusterIssuer
  dnsNames:
  - '${var.GRAFANA_DOMAIN}'   
    YAML
}


resource "kubernetes_ingress_v1" "grafana" {

    depends_on = [kubernetes_namespace.prometheus, kubectl_manifest.grafana-certificate]

    metadata {
        name = "grafana"
        namespace = "prometheus"
    }

    spec {
        rule {

            host = var.GRAFANA_DOMAIN

            http {

                path {
                    path = "/"

                    backend {
                        service {
                            name = "prometheus-grafana"
                            port {
                                number = 80
                            }
                        }
                    }

                }
            }
        }

        tls {
          secret_name = "grafana-cert"
          hosts = [var.GRAFANA_DOMAIN]
        }
    }
}

resource "cloudflare_record" "grafana" {
    depends_on = [
      data.kubernetes_service.traefik
    ]

    zone_id = var.CLOUDFLARE_ZONE_ID
    name = var.GRAFANA_DOMAIN
    value =  data.kubernetes_service.traefik.status[0].load_balancer[0].ingress[0].ip
    type = "A"
    proxied = false
}
