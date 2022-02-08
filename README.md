# Proof-of-Humanity Core UI

This repository provides an example UI for Proof-of-Humanity core contract.

## Demo

Live demo: https://proof-of-humanity-core-ui.glitch.me/

## UI

Features implemented:
* add delegate (only core contract owner)
* verify Proof-of-Humanity evidence for any address

## API

Method for checking proof-of-humanity for an address:

### Request

```
GET /api/v1/verify/{address}
```

### Response

```
{
  result: <boolean>
  timestamp: <ISO string>
}
```

## Other parts of the project

* Core contract: https://github.com/bakoushin/proof-of-humanity
* hCaptcha delegate: https://github.com/bakoushin/proof-of-humanity-delegate

## Author

Alex Bakoushin

## License

MIT
