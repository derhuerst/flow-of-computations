'use strict'

// handle inconsistent export
const Queue = require('tinyqueue').default || require('tinyqueue')

const replaceAt = (arr, idx, val) => [
	...arr.slice(0, idx), val, ...arr.slice(idx + 1)
]

const overlappingPairs = (arr) => {
	const res = []
	for (let i = 0; i < arr.length - 1; i++) res.push([arr[i], arr[i + 1]])
	return res
}

const addIfMissing = (arr, item) => {
	return arr.includes(item) ? arr : [...arr, item]
}

const createLoop = () => {
	// todo: incorporate task age into priority
	const queue = new Queue([], (a, b) => a[0] - b[0])
	const add = (prio, task, payload) => {
		queue.push([prio, [task, payload]])
	}
	const pop = () => queue.length === 0 ? null : queue.pop()[1]
	return {add, pop}
}

module.exports = {
	replaceAt,
	overlappingPairs,
	addIfMissing,
	createLoop
}
