# create-product-plate

Create a lean Product Plate application with one fixed profile.

```sh
bun create product-plate my-app --profile solo-saas --name "My Product" --description "A focused product." --theme neutral --yes
```

Generated apps include profile-aware launch checks and safe managed-file upgrades:

```sh
bun run doctor
bun run verify:launch
bunx product-plate upgrade --check
bunx product-plate upgrade --apply
```

See the [Product Plate repository](https://github.com/rodrgds/productplate) for profile contracts and release notes.
