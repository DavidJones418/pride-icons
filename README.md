# <img src="src/pride.svg" alt="Pride Icon" width="24" height="24" /> Pride Icons

Icon versions of [Daniel Quasar’s _Progress Pride_ flag](https://progress.gay).

## Usage

Copy the files from `dist/` to your public directory, e.g. `npx degit davidjones418/pride-icons/dist static`:

- [`dist/apple-touch-icon.png`](dist/apple-touch-icon.png)
- [`dist/favicon.ico`](dist/favicon.ico)
- [`dist/favicon.svg`](dist/favicon.svg)

Link to the favicons:

```html
<html>
  <head>
    ...
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  ...
</html>
```

Omit the link to `/apple-touch-icon.png` to stop Firefox loading it.

This snippet was tested in Chrome 98, Firefox 97, and Safari 15.3:

- Chrome fetches `/favicon.svg`
- Firefox fetches `/favicon.svg`
- Safari fetches `/favicon.ico`
- “Add to Home Screen” on iOS fetches `/apple-touch-icon.png`

_Note that Safari aggressively caches favicons. Try emptying `~/Library/Safari/Favicon Cache` through Finder to get new icons to show up during testing._

## Files

Generated from [`src/pride.svg`](src/pride.svg) by [`scripts/build.js`](scripts/build.js).

### [`dist/apple-touch-icon.png`](dist/apple-touch-icon.png)

![dist/apple-touch-icon.png](dist/apple-touch-icon.png)

### [`dist/favicon.ico`](dist/favicon.ico)

![dist/favicon.ico](dist/favicon.ico)

### [`dist/favicon.svg`](dist/favicon.svg)

![dist/favicon.svg](dist/favicon.svg)

## License

[MIT](LICENSE). Based on the _Progress Pride_ flag [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) Daniel Quasar.
