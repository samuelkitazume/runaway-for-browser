terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      # Pinned to the v4.x line for stability on a first-Terraform project.
      # The v5+ schemas changed several resource attribute names; once this
      # project is comfortable, see terraform/README.md for the upgrade path.
      version = "~> 4.40"
    }
  }
}

provider "cloudflare" {
  # Token can come from either:
  #   1. var.cloudflare_api_token  (set in terraform.tfvars — file is git-ignored)
  #   2. CLOUDFLARE_API_TOKEN env var  (when the variable is null/unset)
  # When var.cloudflare_api_token is null, this argument is effectively absent
  # and the provider falls back to its standard env-var lookup. See
  # terraform/README.md for the tradeoffs between the two approaches.
  api_token = var.cloudflare_api_token
}
