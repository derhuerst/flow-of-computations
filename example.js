'use strict'

const {
	add, zip, sum, print
} = require('./ops')

const A = [
	[0, 0, [10, 20, 30]], // insert 10, 20, 30
	[1, 1, [50]] // replace 2nd by 50
] // evaluates to `[10, 50, 30]`
A.name = 'A'
const B = [
	[0, 0, [10, 100, 1000]] // insert 10, 100, 1000
] // evaluates to `[10, 100, 1000]`
B.name = 'B'

const adder = add(3)
const zipper = zip(2)
const summer = sum()
const printer = print('printer')

const pipe1 = combine(adder, 0, zipper, 0, summer, printer)
const pipe2 = combine(zipper, 0, summer)
pipe1(0, A[0])
pipe2(1, B[0])
pipe1(0, A[1])
