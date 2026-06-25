{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    bun.enable = true;
    package = pkgs.nodejs_22;
  };

  packages = [
    pkgs.git
    pkgs.jq
    pkgs.ripgrep
  ];

  env.NODE_OPTIONS = "--max-old-space-size=4096";

  git-hooks = {
    enable = true;
    default_stages = [ "pre-commit" "pre-push" ];

    hooks = {
      staged-quality = {
        enable = true;
        name = "staged quality";
        stages = [ "pre-commit" ];
        pass_filenames = false;
        entry = ''
          bash -euo pipefail -c '
            files="$(git diff --cached --name-only --diff-filter=ACMR)"
            [ -n "$files" ] || exit 0

            js_files="$(printf "%s\n" "$files" | grep -E "\.(js|ts|svelte)$" || true)"
            format_files="$(printf "%s\n" "$files" | grep -E "\.(json|css|md)$" || true)"

            if [ -n "$js_files" ]; then
              printf "%s\n" "$js_files" | xargs bun eslint --fix
              printf "%s\n" "$js_files" | xargs bun prettier --write
            fi

            if [ -n "$format_files" ]; then
              printf "%s\n" "$format_files" | xargs bun prettier --write
            fi

            printf "%s\n" "$files" | xargs git add
            bun run test:unit
          '
        '';
      };

      push-quality = {
        enable = true;
        name = "push quality";
        stages = [ "pre-push" ];
        pass_filenames = false;
        entry = ''
          bash -euo pipefail -c '
            export PUBLIC_CONVEX_URL="''${PUBLIC_CONVEX_URL:-https://fake-convex-url.convex.cloud}"
            export PUBLIC_CONVEX_SITE_URL="''${PUBLIC_CONVEX_SITE_URL:-https://fake-convex-site-url.convex.site}"
            export SITE_URL="''${SITE_URL:-https://fake-site-url.com}"
            export NODE_OPTIONS="''${NODE_OPTIONS:---max-old-space-size=4096}"

            # Only inspect files that changed versus the upstream branch.
            # eslint uses type-aware linting, so a full repo run is ~60s;
            # limiting to changed files keeps the pre-push hook snappy and
            # still catches issues introduced by this push.
            upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || echo origin/main)"
            files="$(git diff --name-only --diff-filter=ACMR "$upstream"...HEAD 2>/dev/null || git diff --name-only --diff-filter=ACMR HEAD~5...HEAD)"
            [ -n "$files" ] || { echo "No files changed; skipping pre-push checks."; exit 0; }

            js_files="$(printf "%s\n" "$files" | grep -E "\.(js|ts|svelte)$" || true)"
            format_files="$(printf "%s\n" "$files" | grep -E "\.(json|css|md)$" || true)"

            if [ -n "$js_files" ]; then
              echo "Running ESLint --fix on changed JS/TS/Svelte files..."
              printf "%s\n" "$js_files" | xargs bun eslint --fix
            fi

            if [ -n "$format_files" ] || [ -n "$js_files" ]; then
              echo "Running prettier --write on changed files..."
              to_format="$(printf "%s\n" "$js_files" "$format_files" | grep -v "^$" | sort -u)"
              printf "%s\n" "$to_format" | xargs bun prettier --write
            fi

            # Stage any autofixes so they end up in the push.
            printf "%s\n" "$files" | xargs git add

            echo "Running typecheck..."
            bun run check

            echo "Running unit tests..."
            bun run test:unit

            echo "Pre-push checks passed. Run \`bun run verify\` to also build."
          '
        '';
      };
    };
  };

  processes = {
    web.exec = "bun run dev";
    convex.exec = "bun convex dev";
  };

  scripts = {
    install.exec = "bun install --frozen-lockfile";
    dev.exec = "bun run dev";
    convex-dev.exec = "bun convex dev";
    check.exec = "bun run check";
    lint.exec = "bun run lint";
    test-unit.exec = "bun run test:unit";
    test-e2e.exec = "bun run test:e2e";
    build.exec = "bun run build";
    verify.exec = "bun run verify";
    setup.exec = ''
      bun install --frozen-lockfile
      if [ ! -f .env.local ]; then
        cp .env.example .env.local
        echo "Created .env.local from .env.example"
      fi
    '';
  };

  enterShell = ''
    echo ""
    echo "  Product Plate"
    echo "  -------------"
    echo "  Bun:  $(bun --version)"
    echo "  Node: $(node --version)"
    echo ""
    echo "  setup       Install dependencies and create .env.local"
    echo "  devenv up   Run SvelteKit and Convex together"
    echo "  dev          Run SvelteKit"
    echo "  convex-dev   Run Convex"
    echo "  verify       Lint, typecheck, test, and build"
    echo ""
  '';

  enterTest = ''
    bun --version
    node --version
    git --version
  '';
}
