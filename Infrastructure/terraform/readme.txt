Since the kube config does not exist yet this deployment needs to run in two steps.
tf apply --target=module.cluster
tf apply