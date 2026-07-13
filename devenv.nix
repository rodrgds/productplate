{ pkgs, ... }:

let
  rawBun = pkgs.stdenvNoCC.mkDerivation {
    pname = "bun";
    version = "1.3.3";

    src = pkgs.fetchzip {
      url = "https://github.com/oven-sh/bun/releases/download/bun-v1.3.3/bun-linux-x64-baseline.zip";
      hash = "sha256-RY9FSb9iXm2+mmy2BIhhPbdFovsv0agz/eT0jfaspl0=";
    };

    nativeBuildInputs = [ pkgs.autoPatchelfHook ];
    buildInputs = [ pkgs.stdenv.cc.cc.lib ];
    dontUnpack = true;

    installPhase = ''
      runHook preInstall
      install -Dm755 "$src/bun" "$out/bin/bun"
      ln -s bun "$out/bin/bunx"
      runHook postInstall
    '';
  };

  bunLauncher = pkgs.writeText "product-plate-bun-launcher.mjs" ''
    import { execve } from "node:process";

    const [bunCommand, ...args] = process.argv.slice(2);
    execve(bunCommand, [bunCommand, "--no-env-file", ...args], process.env);
  '';

  mkBunWrapper =
    name:
    pkgs.writeShellApplication {
      inherit name;
      text = ''
        env_args=()
        for env_file in .env .env.local; do
          if [[ -f "$env_file" ]]; then
            env_args+=("--env-file=$env_file")
          fi
        done

        exec "${pkgs.nodejs_22}/bin/node" "''${env_args[@]}" \
          "${bunLauncher}" "${rawBun}/bin/${name}" "$@"
      '';
    };

  bun = mkBunWrapper "bun";
  bunx = mkBunWrapper "bunx";
  bunWrappers = pkgs.symlinkJoin {
    name = "product-plate-bun-wrappers";
    paths = [
      bun
      bunx
    ];
  };

  frozenInstall = pkgs.writeShellApplication {
    name = "product-plate-frozen-install";
    runtimeInputs = [ pkgs.coreutils ];
    text = ''
      project_root=$PWD
      install_root=$(mktemp -d "$project_root/../.product-plate-install.XXXXXX")
      trap 'rm -rf "$install_root"' EXIT

      cp "$project_root/package.json" "$install_root/package.json"
      cp "$project_root/bun.lock" "$install_root/bun.lock"

      cd "$install_root"
      env -i \
        HOME="$HOME" \
        PATH="${rawBun}/bin:${pkgs.nodejs_22}/bin:${pkgs.coreutils}/bin" \
        "${rawBun}/bin/bun" --no-env-file install --frozen-lockfile "$@"

      mkdir -p "$install_root/node_modules"
      rm -rf "$project_root/node_modules"
      mv "$install_root/node_modules" "$project_root/node_modules"
    '';
  };
in
{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    bun = {
      enable = true;
      package = bunWrappers;
    };
  };

  packages = [
    pkgs.git
    pkgs.jq
    pkgs.ripgrep
  ];

  env.NODE_OPTIONS = "--max-old-space-size=4096";
  dotenv.disableHint = true;

  processes = {
    web.exec = "bun run dev";
    convex.exec = "bun convex dev";
  };

  scripts = {
    install.exec = "${frozenInstall}/bin/product-plate-frozen-install";
    setup.exec = ''
      ${frozenInstall}/bin/product-plate-frozen-install
      if [ ! -f .env.local ]; then
        cp .env.example .env.local
        echo "Created .env.local from .env.example"
      fi
    '';
    dev.exec = "bun run dev";
    convex-dev.exec = "bun convex dev";
    check.exec = "bun run check";
    typecheck.exec = "bun run check";
    format-check.exec = "bun run format:check";
    lint.exec = "bun run lint";
    test-unit.exec = "bun run test:unit";
    test-e2e.exec = "bun run test:e2e";
    build.exec = "bun run build";
    verify.exec = "bun run verify";
    verify-full.exec = "bun run verify:full";
  };

  enterShell = ''
    echo ""
    echo "  Product Plate"
    echo "  -------------"
    echo "  Bun:  $(bun --version)"
    echo "  Node: $(node --version)"
    echo ""
    echo "  setup         Frozen install and create .env.local if missing"
    echo "  devenv up     Run SvelteKit and Convex together"
    echo "  dev           Run SvelteKit"
    echo "  convex-dev    Run Convex"
    echo "  check         Type-check Svelte and TypeScript"
    echo "  format-check  Check formatting without changing files"
    echo "  lint          Check formatting and ESLint"
    echo "  test-unit     Run unit tests"
    echo "  test-e2e      Run Playwright tests"
    echo "  build         Build for production"
    echo "  verify        Run NAS-safe lint, typecheck, and unit tests"
    echo "  verify-full   Add the resource-heavy production build"
    echo ""
  '';

  enterTest = ''
    bun --version
    bun -e 'console.log("bun runtime ok")'
    node --version
    git --version
  '';
}
