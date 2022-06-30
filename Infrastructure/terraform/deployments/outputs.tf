# TODO: find ip
output "test" {
  value = helm_release.traefik
  sensitive = true
}