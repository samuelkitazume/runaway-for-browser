locals {
  fqdn = "${var.subdomain}.${var.zone_name}"
}

# The Pages project itself. We deliberately omit the `source` block so the
# project is created in *direct upload* mode — deployments are pushed with
# `wrangler pages deploy` instead of being built by Cloudflare from a Git repo.
#
# Why direct upload first:
#   - No Cloudflare-GitHub-App dance required before `terraform apply` works.
#   - Phase 1's goal is to ship the existing /legacy folder as-is. There's
#     nothing to build, so a build pipeline would be ceremony.
#   - Phase 1.5 (GitHub Actions) is where we add automated deploys on top of
#     this same project resource.
resource "cloudflare_pages_project" "this" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = "main"
}

# Attach the custom subdomain (e.g. runaway.example.com) to the Pages project.
# This must be paired with a DNS record below; Cloudflare validates the CNAME
# during attachment.
resource "cloudflare_pages_domain" "this" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.this.name
  domain       = local.fqdn

  # Make ordering explicit: the DNS record must exist before the domain
  # attachment is attempted.
  depends_on = [cloudflare_record.subdomain]
}

# CNAME pointing the subdomain at the Pages project's <name>.pages.dev host.
# `proxied = true` puts the record behind Cloudflare's edge so we get free
# HTTPS termination and the orange-cloud benefits.
#
# `allow_overwrite = true` is defensive: if Cloudflare auto-created a record
# when the custom domain was set up via the dashboard previously, this lets
# Terraform take ownership of it on the first apply rather than erroring out
# on a duplicate.
resource "cloudflare_record" "subdomain" {
  zone_id         = var.cloudflare_zone_id
  name            = var.subdomain
  type            = "CNAME"
  value           = "${var.project_name}.pages.dev"
  proxied         = true
  ttl             = 1 # 1 = "auto"; required when proxied = true
  allow_overwrite = true
  comment         = "Runaway for Browser — Cloudflare Pages (managed by Terraform)"
}
