variable "cloudflare_api_token" {
  description = <<-EOT
    Cloudflare API token used by the provider. Optional in this config:
      - If set (e.g. in terraform.tfvars), Terraform passes it to the provider directly.
      - If null/omitted, the provider falls back to the CLOUDFLARE_API_TOKEN env var.
    SENSITIVE — never commit a value for this. terraform.tfvars is git-ignored.
    Note: if you put the token in tfvars, it will also live in terraform.tfstate.
  EOT
  type        = string
  sensitive   = true
  nullable    = true
  default     = null
}

variable "cloudflare_account_id" {
  description = "Your Cloudflare account ID (Dashboard → right sidebar on any zone overview page)."
  type        = string
}

variable "cloudflare_zone_id" {
  description = "The Cloudflare zone ID for the parent domain (Dashboard → zone overview → API section)."
  type        = string
}

variable "zone_name" {
  description = "The apex domain registered on Cloudflare, e.g. \"example.com\". Used to assemble the FQDN."
  type        = string
}

variable "subdomain" {
  description = "The subdomain to serve the game from, e.g. \"runaway\". The site will live at <subdomain>.<zone_name>."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$", var.subdomain))
    error_message = "subdomain must be a single DNS label (lowercase letters, digits, hyphens; not starting or ending with a hyphen)."
  }
}

variable "project_name" {
  description = "Cloudflare Pages project name. Lowercase, hyphenated. Becomes <project_name>.pages.dev."
  type        = string
  default     = "runaway-for-browser"

  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$", var.project_name))
    error_message = "project_name must be a single DNS label (lowercase letters, digits, hyphens; not starting or ending with a hyphen)."
  }
}
