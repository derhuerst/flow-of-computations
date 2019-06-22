# `@derhuerst/flow-of-computations`

**Filter, transform and merge sets of data.**

- A [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) of operations. Each operation gets data from its `>=1` predecessors and transforms it.
- Data sources can be static or streaming/live, as they emit diffs (looks like a[`splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) call) just like every operation.
- The computation of the whole graph is done step by step via an [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators).

[![npm version](https://img.shields.io/npm/v/@derhuerst/flow-of-computations.svg)](https://www.npmjs.com/package/@derhuerst/flow-of-computations)
[![build status](https://api.travis-ci.org/derhuerst/@derhuerst/flow-of-computations.svg?branch=master)](https://travis-ci.org/derhuerst/@derhuerst/flow-of-computations)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/@derhuerst/flow-of-computations.svg)
![minimum Node.js version](https://img.shields.io/node/v/berlin-postal-code-areas.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installation

```shell
npm install @derhuerst/flow-of-computations
```


## Usage

```js
const {withStore, createFlow, flowRunner} = require('@derhuerst/flow-of-computations')
const {add, zip, sum, print} = require('@derhuerst/flow-of-computations/ops')

// Our data sources, called inputs. Each is a list of diffs.
const dataSourceA = [
	[0, 0, [10, 20, 30]], // insert 10, 20, 30
	[1, 1, [50]] // replace 2nd by 50
] // evaluates to [10, 50, 30]
const dataSourceB = [
	[0, 0, [10, 100, 1000]] // insert 10, 100, 1000
] // evaluates to [10, 100, 1000]

// Use withStore to access the data of an operation (all diffs "applied") at any time.
const sumOp = withStore(sum())

const zipOp = zip(2)
const flow = createFlow([ // list of data sources
	dataSourceA, dataSourceB
], [ // list of op connections
	[dataSourceA, add(3), zipOp],
	[dataSourceB, zipOp],
	[zipOp, sumOp, print('diff printer')]
])

// Because our data sources are static, we can use a loop to iterate over each step of
// the computation.
for (const _ of flowRunner(flow)) {}
console.log('data in sumOp:', sumOp.data())
```

```
diff printer { idx: 0, del: 0, newItems: [ 13, 23, 33 ] }
diff printer { idx: 0, del: 3, newItems: [ 23, 123, 1033 ] }
diff printer { idx: 0, del: 3, newItems: [ 23, 153, 1033 ] }
data in sumOp: [ 23, 153, 1033 ]
```


## Contributing

If you have a question or need support using `@derhuerst/flow-of-computations`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/@derhuerst/flow-of-computations/issues).
