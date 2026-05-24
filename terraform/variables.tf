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
