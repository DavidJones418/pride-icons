# <img src="src/pride.svg" alt="Pride Icon" width="24" height="24" /> Pride Icons

Icon versions of [Daniel Quasar’s _Progress Pride_ flag](https://progress.gay).

## Usage

Copy the files from `dist/static/` to your public directory:

```sh
# If static files live in /static (e.g. SvelteKit):
npx degit davidjones418/pride-icons/dist --force

# ...or if static files live in /public (e.g. Next.js):
npx degit davidjones418/pride-icons/dist/static public --force

# ...or if static files live in / (e.g. Eleventy):
npx degit davidjones418/pride-icons/dist/static --force
```

Link to the SVG favicon:

```html
<html>
  <head>
    ...
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  ...
</html>
```

Chrome and Firefox fetch `/favicon.svg` correctly when it is linked in `<head>`, falling back to `/favicon.ico`. Safari as of version 15.3 does not recognise SVG favicons and does not appear to request `/favicon.ico`. Adding the site to favorites or the home screen uses `/apple-touch-icon.png`.

> ℹ️ Safari aggressively caches favicons, ignoring caching headers and markup changes. To get new icons to show up during testing:
>
> 1. Quit Safari.
> 2. **Finder > Go > Go to Folder...** and enter `~/Library/Safari/Favicon Cache`.
> 3. Delete the contents of `Favicon Cache`.
> 4. Re-open Safari, and make sure that the _Developer Tools Network Tab_ is open before loading the site for the first time to see the icon request.

## Files

Generated from [`src/pride.svg`](src/pride.svg) by [`scripts/build.js`](scripts/build.js).

### [`dist/static/apple-touch-icon.png`](dist/static/apple-touch-icon.png)

![dist/static/apple-touch-icon.png](dist/static/apple-touch-icon.png)

### [`dist/static/favicon.ico`](dist/static/favicon.ico)

![dist/static/favicon.ico](dist/static/favicon.ico)

### [`dist/static/favicon.svg`](dist/static/favicon.svg)

![dist/static/favicon.svg](dist/static/favicon.svg)

## License

[MIT](LICENSE)

Derived from the _Progress Pride_ flag design ([CC-BY-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) Daniel Quasar)
