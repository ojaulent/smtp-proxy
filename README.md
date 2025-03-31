# smtp-proxy
A simple SMTP proxy usable on a local network without auth and without encryption and which relay mail to your isp with encryption, written in brainless mode with an IA.

## setup

### You MUST set env vars

- **SMTP_RELAY_HOST**, your isp provider (eg. smtp.myisp.com)
- **SMTP_RELAY_PORT**: your isp port (eg. 465)
- **SMTP_RELAY_USER**: your isp username (eg. me@myisp.com)
- **SMTP_RELAY_PASS**: your isp password (eg. mysecretpassword)

### Optionaly you can define 

- **SMTP_LOCAL_SERVER_PORT**: your local port (*default* 25)

## Run

### With node
```
$ node index.js
```

### With Docker
```
TODO
```
