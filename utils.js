'use strict'

const combine = (first, ...next) => {
	const steps = []
	for (let i = 0; i < next.length; i += 2) {
		const inputIdx = next[i]
		const operation = next[i + 1]
		steps.push([inputIdx, operation])
	}

	const combiner = (inputIdx, diff) => {
		diff = first(inputIdx, diff)
		for (const [inputIdx, op] of steps) diff = op(inputIdx, diff)
		return diff
	}

	combiner.arity = first.arity
	combiner.data = () => second.data()
	return combiner
}

const withStore = (op) => {
	const data = []

	const opWithStore = (inputIdx, inDiff) => {
		const outDiff = op(inputIdx, inDiff)
		const [idx, del, newItems] = outDiff
		data.splice(idx, del, ...newItems)
		return outDiff
	}

	opWithStore.opName = op.opName
	opWithStore.arity = op.arity
	opWithStore.toString = () => `opWithStore(${op})`
	opWithStore.data = () => data
	return opWithStore
}

module.exports = {
	combine,
	withStore
}
