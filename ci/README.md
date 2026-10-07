# CI infrastructure

CI runs on the self-hosted GitHub Actions runner (`vps`, user `gh-runner`) in two deliberately
separate privilege domains:

| Domain | How a step uses it | Privilege |
| --- | --- | --- |
| **Build / test / Playwright** | `./ci/run-ci COMMAND…`, `./ci/run-playwright` | A disposable rootless Podman container. Root and `sudo` work *inside* it; container root is an unprivileged subordinate uid on the host. |
| **Host deployment** | `sudo -n /usr/local/sbin/ci-host service {restart\|status} UNIT` | One root-owned broker with an allowlist. The runner's only sudo rule. |

Nothing else runs with host privileges: the runner has no host `apt`, no Docker group, and no
`systemctl` rules of its own.

## `ci/run-ci`

```sh
./ci/run-ci pnpm install --frozen-lockfile --prefer-offline
./ci/run-ci pnpm test:int
./ci/run-ci --postgres pnpm test:e2e     # plus a throwaway postgres:16 at 127.0.0.1:5432
./ci/run-playwright                      # = run-ci --postgres -- pnpm test:e2e --reporter=line
./ci/run-ci sudo apt-get install -y …    # fine: affects only this container
./ci/run-ci --image ubuntu:24.04@sha256:… --root bash -c 'apt-get install -y ./x.deb'
                                         # clean-install smoke test in a stock image
```

The same `run-ci` is copied verbatim into every repository that uses the runner
(payload-markdown, payload-markdown-docs, vl-release); it derives the image
(`localhost/<repo>-ci`) and cache (`~/.cache/<repo>-ci`) names from the repository directory,
and each repository keeps its own `ci/Containerfile`.

- **Image**: `ci/Containerfile`, built on first use and tagged by its content plus the newest
  `vl-release`/`pmdocs` in the ValkyrianLabs APT index (a new tool release or a Containerfile edit
  rebuilds it; older tags are removed). Base: `mcr.microsoft.com/playwright:v1.58.2-noble`, pinned
  by digest, with Chromium/Firefox/WebKit and their OS libraries; plus Node (`.nvmrc`), pnpm
  (`packageManager`), git, gh, vlr and pmdocs. `dev/ci.int.spec.ts` keeps the versions in step
  with `pnpm-lock.yaml`, `.nvmrc` and `package.json`.
- **Mounts** (nothing else from the host is visible):
  - the repository → `/workspace` (read-write)
  - `~/.cache/payload-markdown-ci/pnpm-store` → `/cache/pnpm-store` (pnpm store)
  - `~/.cache/payload-markdown-ci/npm` → `/cache/npm` (npm cache)
  - under Actions, `$RUNNER_TEMP` at the same path (`GITHUB_OUTPUT`, `GITHUB_ENV`,
    `GITHUB_STEP_SUMMARY`, checkout's credential file)
- **Privileges**: rootless Podman, `--userns=keep-id` (the step runs as the calling uid, so files
  stay owned by `gh-runner`), no `--privileged`, no extra capabilities, no Podman or Docker
  socket, no host `/`, `/etc`, `/root` or home directory. Limits: 12 GiB memory, 16384 pids,
  2 GiB `/dev/shm` (Chromium), `--timeout` 3 h. `--init` (catatonit) reaps child processes.
- **Environment**: `CI`, `GITHUB_*`, `RUNNER_*`, the OIDC request variables (`pmdocs push
  --github-oidc`), `GH_TOKEN`, `DATABASE_URL`, `PAYLOAD_SECRET`, `NODE_OPTIONS`, `NEXT_CPU_COUNT`,
  `RELEASE_*`, `DOCS_SYNC_ENDPOINT`, `PMDOCS_SOURCE`, `PLAYWRIGHT_PORT`, `TZ`; more by name
  with `CI_ENV="NAME …"`. `GITHUB_WORKSPACE` is `/workspace` inside.
- **Cleanup**: the container (and pod) is removed on exit and on SIGINT/SIGTERM (job
  cancellation). After a SIGKILL, the next `run-ci` reaps containers whose owner is gone. Files a
  step wrote as container root are handed back to the caller on exit, so checkout can always
  clean the workspace.
- **Exit status** is the command's.

`--root` runs as container root (for stock images without sudo); `CI_MEMORY`, `CI_TIMEOUT`
(seconds) and `CI_CACHE_DIR` override the defaults.

Workflows call the wrappers; GitHub-hosted runners (used for pull requests from forks) have
Podman too and build the same image.

## Host broker: `ci-host`

Source: `ci/host/ci-host`, installed root:root 0755 at `/usr/local/sbin/ci-host`.

```sh
sudo -n /usr/local/sbin/ci-host service restart valkyrianlabs
sudo -n /usr/local/sbin/ci-host service status  valkyrianlabs
```

- Exactly three arguments: `service`, `restart` or `status`, and a bare unit name
  (`^[a-z0-9][a-z0-9-]{0,62}$`: no paths, `.service`, `@`, globs, options or metacharacters).
- The unit must be listed in `/etc/ci-host/services` (root:root, not group/world writable;
  source `ci/host/services`). Adding an application is one line there.
- `restart` waits up to 60 s for the unit to become active and fails (with `systemctl status`)
  otherwise. Every call, accepted or refused, is logged to the journal (`journalctl -t ci-host`).
- No `eval`, no shell, absolute `systemctl`, fixed `PATH`, `--no-pager`.

The runner's whole sudoers file (`ci/host/sudoers`):

```
gh-runner ALL=(root) NOPASSWD: /usr/local/sbin/ci-host service *
```

The wildcard is safe only because `ci-host` parses and validates every argument itself.

## Provisioning (once, by an administrator)

```sh
sudo ci/bootstrap              # rootless Podman for gh-runner (subuids, linger) + broker
sudo ci/bootstrap --sudoers    # then replace the runner's sudoers with ci/host/sudoers
```

Host packages are provisioning, never a CI step. Anything a test needs goes into
`ci/Containerfile` (or a `sudo apt-get` inside `run-ci`).

## Rollback

Backups of the previous state live in `/root/ci-migration-20261007/` on the VPS (sudoers,
runner config, group memberships, package list, runner unit/status).

1. `sudo install -m 0440 /root/ci-migration-20261007/sudoers.d-gh-runner /etc/sudoers.d/gh-runner && sudo visudo -c`
2. If the Docker group was removed: `sudo usermod -aG docker gh-runner && sudo systemctl restart actions.runner.coopsdev.vps.service`
3. Revert the workflow commits (git history keeps the previous `setup-node`/`services:` versions).

`/usr/local/sbin/ci-host`, `/etc/ci-host/` and rootless Podman can stay; nothing depends on them
once the workflows are reverted.
