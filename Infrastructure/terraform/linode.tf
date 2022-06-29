resource "linode_lke_cluster" "my-cluster" {
    label       = "my-cluster"
    k8s_version = "1.23"
    region      = "us-central"
    tags        = ["prod"]

    pool {
        type  = "g6-standard-1"
        count = 3
    }

    control_plane {
      high_availability = false
    }
}

resource "local_sensitive_file" "kube_config" {
    depends_on = [
        linode_lke_cluster.my-cluster
    ]

    filename = "${var.KUBE_CONFIG_PATH}"
    content = "${base64decode(module.my-cluster.kubeconfig)}"
}

resource "time_sleep" "wait_for_kubernetes" {

    depends_on = [
        linode_lke_cluster.my-cluster
    ]

    create_duration = "20s"
}