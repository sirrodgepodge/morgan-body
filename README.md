# Morgan Body Next

This is the development branch of the next release (v3).
Three main goals of v3:

- Rewrite in **TypeScript**
- Compatibility across **more** libraries via **drivers** (not be limited only to Express)
- Easier way to log on multiple places via **transports** (let user do custom implementation of logging)

## TODO

- ~~Implement transports~~
- ~~Complete codebase transfer to TypeScript~~
- Write new tests
  - Find a way to easily test registerMiddleware functions
- ~~Cleanup some old code~~
- ~~Get rid of [expressjs/morgan](https://github.com/expressjs/morgan)~~
- Make sure all missing features are implemented
  - Skip
  - Express Driver Request Id
- Fix all known issues (see [Known Issues](#known-issues))
- Write new README and a documentation
- Create new name, as `morgan-body` will become misleading

## Known Issues

- Themes do not work, except for defaultTheme
