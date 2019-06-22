'use strict'

const {createFlow, flowRunner} = require('.')
const {withStore} = require('./utils')
const {
	add, zip, sum, print
} = require('./ops')

const A = [
	[0, 0, [10, 20, 30]], // insert 10, 20, 30
	[1, 1, [50]] // replace 2nd by 50
] // evaluates to `[10, 50, 30]`
const B = [
	[0, 0, [10, 100, 1000]] // insert 10, 100, 1000
] // evaluates to `[10, 100, 1000]`

const adder = add(3)
const zipper = zip(2)
const summer = withStore(sum())
const printer = print('printer')

const flow = createFlow([A, B], [
	[A, adder, zipper],
	[B, zipper],
	[zipper, summer, printer]
])

const runner = flowRunner(flow)
for (const _ of runner) {}
console.error('summer', summer.data())
