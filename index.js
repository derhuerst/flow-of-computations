'use strict'

const findCycles = require('find-cycle/directed')
const {overlappingPairs, addIfMissing, createLoop} = require('./lib/helpers')

const createFlow = (inputs, pipes) => {
	const forward = new Map() // op/input -> [op]
	const backward = new Map() // op -> [op/input]
	for (const pipe of pipes) {
		for (const [from, to] of overlappingPairs(pipe)) {
			const connectedForward = forward.get(from) || new Set()
			connectedForward.add(to)
			forward.set(from, connectedForward)

			const connectedBackward = backward.get(to) || []
			backward.set(to, addIfMissing(connectedBackward, from))
		}
	}

	const validateOpOrInput = (opOrInput) => {
		if ('function' === typeof opOrInput) return;
		if (inputs.includes(opOrInput)) return;
		throw new Error('pipes must only contain inputs and operations')
	}
	for (const [from, connected] of forward) {
		validateOpOrInput(from)
		for (const to of connected) validateOpOrInput(to)
	}

	if (findCycles(inputs, from => forward.get(from))) {
		throw new Error('circular flow detected')
	}

	const prios = new WeakMap() // 0 is the highest
	for (const [from, connected] of forward) {
		for (const to of connected) {
			const fromPrio = prios.get(from) || 0
			const toPrio = prios.get(to) || 0
			prios.set(to, fromPrio + toPrio + 1)
		}
	}

	for (const [to, connected] of backward) {
		const nr = connected.length
		if (nr > to.arity) {
			throw new Error(`${to} is connected to too many ops (${nr})`)
		}
	}
	return {inputs, forward, backward, prios}
}

const flowRunner = ({inputs, forward, backward, prios}, async = true) => {
	const {add, isEmpty, pop} = createLoop()
	const queuedDiffs = new Map() // op -> [diff]
	const iters = new WeakMap() // input -> iterator
	for (const input of inputs) iters.set(input, input[Symbol.iterator]())

	const onDiff = (diff, from) => {
		for (const op of forward.get(from) || []) {
			const inputIdx = backward.get(op).indexOf(from)
			const queue = queuedDiffs.get(from) || []
			queuedDiffs.set(op, [...queue, [inputIdx, diff]])
			add(prios.get(op), runOp, op)
		}
	}

	const runOp = (op) => {
		const queue = queuedDiffs.get(op)
		if (!queue || queue.length === 0) return;

		const [inputIdx, diff] = queue.shift()
		const newDiff = op(inputIdx, diff)
		onDiff(newDiff, op)

		if (queue.length > 0) add(prio.get(op), runOp, op) // add self
	}

	if (async) {
		const readFromInput = async (input) => {
			const {done, value: diff} = await iters.get(input).next()
			if (!done) {
				onDiff(diff, input)
				add(100, readFromInput, input) // add self
			}
		}
		for (const input of inputs) add(100, readFromInput, input)

		const tick = async () => {
			const task = pop()
			if (!task) return {done: true, value: undefined}

			const [fn, payload] = task
			await fn(payload)
			return {done: false, value: undefined}
		}

		const iterator = {next: tick}
		return {[Symbol.asyncIterator]: () => iterator}
	} else {
		const readFromInput = (input) => {
			const {done, value: diff} = iters.get(input).next()
			if (!done) {
				onDiff(diff, input)
				add(100, readFromInput, input) // add self
			}
		}
		for (const input of inputs) add(100, readFromInput, input)

		const tick = () => {
			const task = pop()
			if (!task) return {done: true, value: undefined}

			const [fn, payload] = task
			fn(payload)
			return {done: false, value: undefined}
		}

		const iterator = {next: tick}
		return {[Symbol.iterator]: () => iterator}
	}
}

module.exports = {
	createFlow,
	flowRunner
}
