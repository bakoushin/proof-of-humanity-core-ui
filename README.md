# Proof-of-Humanity Core UI

This repository provides an example UI for Proof-of-Humanity core contract.

## Demo

Live demo: https://proof-of-humanity-core-ui.glitch.me/

## UI

Features implemented:
* add delegate (only core contract owner)
* verify Proof-of-Humanity evidence for any address or transaction sender

The UI is deliberately made using plain HTML, CSS and vanilla JavaScript in order to not affect the example with any framework specifics.

## API

### Verifying humanity of an address:

Method for checking proof-of-humanity for an address:

#### Request

```
GET /api/v1/verify-address/{address}
```

#### Response

```
{
  result: <boolean>
  timestamp: <ISO string>
}
```

### Verifying humanity of a transaction sender:

#### Request

```
GET /api/v1/verify-transaction/{hash}
```

#### Response

```
{
  error: <boolean|string>
  result: <boolean>
  address: <string>
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
