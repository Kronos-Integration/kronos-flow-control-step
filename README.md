[![npm](https://img.shields.io/npm/v/kronos-flow-control-step.svg)](https://www.npmjs.com/package/kronos-flow-control-step)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/Kronos-Integration/kronos-flow-control-step)
[![Build Status](https://secure.travis-ci.org/Kronos-Integration/kronos-flow-control-step.png)](http://travis-ci.org/Kronos-Integration/kronos-flow-control-step)
[![bithound](https://www.bithound.io/github/Kronos-Integration/kronos-flow-control-step/badges/score.svg)](https://www.bithound.io/github/Kronos-Integration/kronos-flow-control-step)
[![codecov.io](http://codecov.io/github/Kronos-Integration/kronos-flow-control-step/coverage.svg?branch=master)](http://codecov.io/github/Kronos-Integration/kronos-flow-control-step?branch=master)
[![Code Climate](https://codeclimate.com/github/Kronos-Integration/kronos-flow-control-step/badges/gpa.svg)](https://codeclimate.com/github/Kronos-Integration/kronos-flow-control-step)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/kronos-flow-control-step.svg?style=flat-square)](https://github.com/Kronos-Integration/kronos-flow-control-step/issues)
[![Dependency Status](https://david-dm.org/Kronos-Integration/kronos-flow-control-step.svg)](https://david-dm.org/Kronos-Integration/kronos-flow-control-step)
[![devDependency Status](https://david-dm.org/Kronos-Integration/kronos-flow-control-step/dev-status.svg)](https://david-dm.org/Kronos-Integration/kronos-flow-control-step#info=devDependencies)
[![docs](http://inch-ci.org/github/Kronos-Integration/kronos-flow-control-step.svg?branch=master)](http://inch-ci.org/github/Kronos-Integration/kronos-flow-control-step)
[![downloads](http://img.shields.io/npm/dm/kronos-flow-control-step.svg?style=flat-square)](https://npmjs.org/package/kronos-flow-control-step)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# kronos-flow-control-step

Step to perform flow controlling actions like load delete stop start

Command endpoint
================

A Request can either be a stream o json data or a an object with data property.

start a flow
------------

```json
{
  "action" : "start",
  "flow" : "my-flow"
}
```

stop a flow
-----------

```json
{
  "action" : "stop",
  "flow" : "my-flow"
}
```

delete a flow
-------------

```json
{
  "action" : "delete",
  "flow" : "my-flow"
}
```

# API

# install

With [npm](http://npmjs.org) do:

```shell
npm install kronos-flow-control-step
```

# license

BSD-2-Clause
