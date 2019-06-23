'use strict'

const _zip = require('lodash/zip')
const {replaceAt} = require('./lib/helpers')

const op = (name, arity, digest) => {
	digest.opName = name
	digest.arity = arity
	digest.toString = () => name + '#' + arity
	return digest
}

const createMap = (mapFn) => {
	const map = (inputIdx, [idx, del, newItems]) => {
		const mapped = newItems.map((item, i) => mapFn(item, idx + i))
		return [idx, del, mapped]
	}
	return op(mapFn.name ? `map(${mapFn.name})` : 'map', 1, map)
}

const createCopy = () => op('copy', 1, createMap(val => val))

const createAdd = x => op(`add(${x})`, 1, createMap(item => item + x))
const createMul = x => op(`mul(${x})`, 1, createMap(item => item * x))

const createZip = (arity, defaultValue = null) => {

	const datas = []
	let zippedLength = 0
	const zip = (inputIdx, [idx, del, newItems]) => {
		let data = datas[inputIdx]
		if (!data) data = datas[inputIdx] = []
		data.splice(idx, del, ...newItems)

		// todo: optimize this
		const prevLength = zippedLength
		const zipped = _zip(...datas)
		zippedLength = zipped.length
		return [0, prevLength, zipped]
	}

	return op('zip', arity, zip)
}

const createReduce = (intialVal, reduceFn) => {
	return op('reduce', 1, createMap(item => item.reduce(reduceFn, intialVal)))
}

const createSum = () => op('sum', 1, createReduce(0, (sum, v) => sum + v))

const createPrint = (name) => {
	const print = (_, [idx, del, newItems]) => {
		console.error(name, {idx, del, newItems})
		return [0, 0, []]
	}
	return op(`print(${name})`, 1, print)
}

module.exports = {
	map: createMap,
	copy: createCopy,
	add: createAdd,
	mul: createMul,
	zip: createZip,
	reduce: createReduce,
	sum: createSum,
	print: createPrint
}
