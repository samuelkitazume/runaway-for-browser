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
  # API token is read from the CLOUDFLARE_API_TOKEN environment variable.
  # Do NOT put the token in any .tf or .tfvars file. See terraform/README.md.
}
