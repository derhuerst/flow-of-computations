'use strict'

const {Suite} = require('benchmark')
const {createFlow, flowRunner} = require('.')
const {add} = require('./ops')

const littleRows = [
	[0, 0, new Array(1000).fill(null).map((_, i) => i)],
	[1, 1, [50]],
	[2, 0, new Array(9000).fill(null).map((_, i) => i)]
]

const chainAdds = (input, n) => {
	const ops = [input]
	for (let i = 0; i < n; i++) {
		const x = [10, 100, 1000][Math.round(Math.random() * 2)]
		ops.push(add(x))
	}
	return createFlow([input], [ops])
}

const runner5Async = flowRunner(chainAdds(littleRows, 5))
const runner1000Async = flowRunner(chainAdds(littleRows, 1000))
const runner5 = flowRunner(chainAdds(littleRows, 5), false)
const runner1000 = flowRunner(chainAdds(littleRows, 1000), false)

new Suite()
.add('5 adds, 10k rows, async', {
	defer: true,
	fn: (deferred) => {
		(async () => {
			for await (const _ of runner5Async) {}
		})().then(() => deferred.resolve())
	}
})
.add('1000 adds, 10k rows, async', {
	defer: true,
	fn: (deferred) => {
		(async () => {
			for await (const _ of runner1000Async) {}
		})().then(() => deferred.resolve())
	}
})
.add('5 adds, 10k rows', () => {
	for (const _ of runner5) {}
})
.add('1000 adds, 10k rows', () => {
	for (const _ of runner1000) {}
})
.on('error', (err) => {
	console.error(err)
	process.exitCode = 1
})
.on('cycle', (e) => {
	console.log(e.target.toString())
})
.run()
