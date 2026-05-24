output "pages_default_url" {
  description = "The default *.pages.dev URL Cloudflare assigns to the project. Useful for sanity-checking deploys before DNS propagates."
  value       = "https://${cloudflare_pages_project.this.subdomain}"
}

output "site_url" {
  description = "The final URL the game is served from, on your custom subdomain."
  value       = "https://${local.fqdn}"
}

output "wrangler_deploy_command" {
  description = "Copy-pasteable command to push the legacy build live after `terraform apply`."
  value       = "npx wrangler pages deploy ../legacy --project-name=${var.project_name} --branch=main"
}
