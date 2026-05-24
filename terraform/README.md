# Terraform — Cloudflare Pages

This folder provisions the hosting for Runaway for Browser:

- A **Cloudflare Pages project** in direct-upload mode
- A **custom domain** (`<subdomain>.<zone_name>`) attached to that project
- A **proxied CNAME** in your Cloudflare DNS pointing the subdomain at `<project_name>.pages.dev`

After `terraform apply`, you push the current build with `wrangler pages deploy`. Phase 1 deploys the `legacy/` folder as-is; later phases swap that for the Phaser/Vite build output.

This is intentionally a small Terraform footprint — five resources across three files — designed to be a clean first hands-on with the tool.

---

## What you need before you start

### Tools

- **Terraform ≥ 1.5** — `winget install Hashicorp.Terraform` (Windows), `brew install terraform` (macOS), or download from [terraform.io/downloads](https://www.terraform.io/downloads).
- **Node.js** (for `wrangler`, the Cloudflare Pages CLI). Any LTS version works.
- A Cloudflare account with the target zone already added (your domain's nameservers pointed at Cloudflare's).

### Cloudflare values to collect

Open the Cloudflare dashboard and grab three values from your zone's overview page (sidebar on the right):

| Value          | Where it is                                                                                                 |
|----------------|-------------------------------------------------------------------------------------------------------------|
| Account ID     | Right sidebar of any zone overview page.                                                                    |
| Zone ID        | Right sidebar of the zone overview page for the domain you want to serve from.                              |
| Zone name      | The apex domain itself, e.g. `example.com`. No protocol, no trailing dot.                                   |

### Create an API token

Dashboard → **My Profile** → **API Tokens** → **Create Token** → **Create Custom Token**.

Required permissions:

| Section  | Permission        | Resource                                            |
|----------|-------------------|-----------------------------------------------------|
| Account  | Cloudflare Pages  | Edit                                                |
| Zone     | DNS               | Edit (scoped to the specific zone you'll serve from) |

Save the token somewhere safe — Cloudflare only shows it once.

---

## First-time setup

### 1. Set the API token as an environment variable

The Cloudflare provider reads `CLOUDFLARE_API_TOKEN` automatically. Do **not** put the token in a `.tf` or `.tfvars` file.

**PowerShell (current session only):**
```powershell
$env:CLOUDFLARE_API_TOKEN = "your-token-here"
```

**PowerShell (persisted to your user profile):**
```powershell
[Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "your-token-here", "User")
# then close and reopen your shell
```

**bash / zsh:**
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

### 2. Fill in your variables

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars and fill in your account ID, zone ID, zone name, subdomain
```

`terraform.tfvars` is git-ignored — your values stay local.

### 3. Init, plan, apply

```powershell
terraform init      # downloads the Cloudflare provider
terraform plan      # shows what will be created (read this!)
terraform apply     # type "yes" when prompted
```

If everything works, you'll see three resources created and three outputs at the end:

```
pages_default_url       = "https://runaway-for-browser.pages.dev"
site_url                = "https://runaway.example.com"
wrangler_deploy_command = "npx wrangler pages deploy ../legacy --project-name=runaway-for-browser --branch=main"
```

### 4. Push the first deploy

The Pages project exists but has no content yet. Run the wrangler command from the output (it will prompt for browser login on first use):

```powershell
npx wrangler pages deploy ../legacy --project-name=runaway-for-browser --branch=main
```

After ~30 seconds:

- `https://runaway-for-browser.pages.dev` serves the 2011 game immediately.
- `https://runaway.example.com` serves it once DNS propagates and Cloudflare issues the TLS cert (usually under a minute, occasionally up to 15).

Open the URL, play the game, confirm `somPunch.mp3` plays when you punch, confirm `somFire.mp3` 404s silently exactly like it did in 2011. Phase 1 complete.

---

## Day-to-day commands

| Command                      | When                                                              |
|------------------------------|-------------------------------------------------------------------|
| `terraform fmt`              | Before committing — formats `.tf` files.                          |
| `terraform validate`         | Quick syntax/schema check, no API calls.                          |
| `terraform plan`             | See what would change without applying.                           |
| `terraform apply`            | Apply pending changes.                                            |
| `terraform output`           | Re-print outputs without re-applying.                             |
| `terraform destroy`          | Tear it all down (the DNS record, the domain attachment, the Pages project itself). |

---

## State

Terraform state lives in `terraform.tfstate` in this folder. It is **git-ignored** because it can contain resource IDs and (depending on resource) sensitive values. For a solo project this is fine — just back the file up if you ever wipe the folder.

When you're ready to upgrade, options for remote state:

- **Terraform Cloud** — free for individuals, web UI for state and runs.
- **Cloudflare R2 + an S3-compatible backend** — keeps everything in the Cloudflare ecosystem.
- **GitHub-encrypted state via tfstate-git** — niche, not recommended.

This is a perfectly good Phase 2+ topic when you've gotten comfortable with the basics.

---

## Things that may bite you

- **CNAME duplicate on first apply.** If you previously created a custom-domain record manually in the Cloudflare dashboard, `cloudflare_record` is set with `allow_overwrite = true` so it adopts the existing record instead of erroring out.
- **Provider version drift.** This config pins `cloudflare/cloudflare ~> 4.40`. The v5+ schemas renamed several attributes; if you upgrade, expect to touch `cloudflare_record` (the `value` attribute became `content`) and `cloudflare_pages_project` (`source` block structure changed). Migrate deliberately, not by accident.
- **`wrangler pages deploy` on a brand-new project.** The first deploy can take a minute or two to show on the custom domain because Cloudflare provisions the TLS cert in the background. The `*.pages.dev` URL is live almost immediately and is the fastest way to verify the deploy worked.
- **The token is account-scoped, not zone-scoped, for the Pages permission.** This is just how Cloudflare structures it — Pages projects belong to accounts. The DNS permission *is* scoped to your one zone.

---

## What Phase 1.5 will add (not yet)

A `.github/workflows/deploy.yml` that runs `wrangler pages deploy` on every push to `main`, so you stop running deploys by hand. The Terraform config above doesn't change — Actions just calls wrangler with the same project name.
