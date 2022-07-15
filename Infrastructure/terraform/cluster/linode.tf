resource "linode_lke_cluster" "my-cluster" {
    label       = "my-cluster"
    k8s_version = "1.23"
    region      = "us-central"
    tags        = ["prod"]

    pool {
        type  = "g6-standard-2"
        count = 3
        /*
        autoscaler {
          min = 3
          max = 5
        }
        */
    }

    control_plane {
      high_availability = false
    }

    # Prevent the count field from overriding autoscaler-created nodes
    /*lifecycle {
        ignore_changes = [
        pool.0.count
        ]
    }*/
}

resource "local_sensitive_file" "kube_config" {
    depends_on = [
        linode_lke_cluster.my-cluster
    ]

    filename = var.KUBE_CONFIG_PATH
    content = "${base64decode(linode_lke_cluster.my-cluster.kubeconfig)}"
}

resource "time_sleep" "wait_for_kubernetes" {

    depends_on = [
        local_sensitive_file.kube_config
    ]

    create_duration = "20s"
}