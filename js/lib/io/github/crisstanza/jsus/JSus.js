class JSus {

	static _1000_x_60_x_60 = 3600000; // 1000 * 60 * 60
	static _1000_x_60 = 60000; // 1000 * 60
	static _1000 = 1000; // 1000

	#settings;

	constructor(settings) {
		this.#settings = settings;
	}

	#formatTime(total) {
		let remainder = total;
		let hours = Math.floor(remainder / JSus._1000_x_60_x_60);
		remainder %= JSus._1000_x_60_x_60;
		let mins = Math.floor(remainder / JSus._1000_x_60);
		remainder %= JSus._1000_x_60;
		let secs = Math.floor(remainder / JSus._1000);
		remainder %= JSus._1000;
		let ms = Math.floor(remainder);
		if (hours > 0) {
			return `${hours}h ${mins}m ${secs}s ${ms}ms`;
		} else if (mins > 0) {
			return `${mins}m ${secs}s ${ms}ms`;
		} else if (secs > 0) {
			return `${secs}s ${ms}ms`;
		} else {
			return `${ms}ms`;
		}
	}

	#isTestableMethod(methodName) {
		return methodName.match(/^test.*/);
	}

	#checkAndTestIt(sb, testObject, testMethod, level) {
		if (testObject[testMethod]) {
			return this.#testIt(sb, testObject, testMethod, null, level);
		}
		return true;
	} S

	#checkAndSkipIt(sb, testObject, testMethod, level) {
		if (testObject && testObject[testMethod]) {
			this.#skipIt(sb, testObject, testMethod, level);
		}
	}

	#newInstance(sb, className, level, n) {
		let instance;
		const inTestNow = 'constructor()';
		const startTime = new Date().getTime();
		try {
			instance = new className();
			const endTime = new Date().getTime();
			sb.push(this.#spaces(level) + '<i>' + n + '.</i> ' + inTestNow + ' <mark success>[SUCCESS]</mark> <time>[' + this.#formatTime(endTime - startTime) + ']</time>');
		} catch (error) {
			instance = null;
			const endTime = new Date().getTime();
			sb.push(this.#spaces(level) + '<i>' + n + '.</i> ' + inTestNow + ' <mark fail>[FAIL]</mark> <time>[' + this.#formatTime(endTime - startTime) + ']</time> ' + error.message);
		}
		return instance;
	}

	#findName(testObjectOrClassName) {
		if (typeof testObjectOrClassName === 'function') {
			return testObjectOrClassName.name;
		}
		return '';
	}

	#skipIt(sb, testObjectOrClassName, testMethod, level) {
		let classOrObject = this.#findName(testObjectOrClassName);
		const inTestNow = classOrObject + '.' + testMethod + '()';
		sb.push(this.#spaces(level) + inTestNow + ' <mark skip>[SKIP]</mark>');
	}

	#testIt(sb, testObjectOrClassName, testMethod, testCase, level) {
		const inputs = []
		for (const key in testCase) {
			inputs.push(testCase[key]);
		}
		let classOrObject = this.#findName(testObjectOrClassName);
		const inTestNow = classOrObject + '.' + testMethod + '(' + (inputs.length ? '...' : '') + ')';
		const startTime = new Date().getTime();
		try {
			testObjectOrClassName[testMethod](...inputs);
			const endTime = new Date().getTime();
			sb.push(this.#spaces(level) + inTestNow + ' <mark success>[SUCCESS]</mark> <time>[' + this.#formatTime(endTime - startTime) + ']</time>');
			return true;
		} catch (error) {
			const endTime = new Date().getTime();
			sb.push(this.#spaces(level) + inTestNow + ' <mark fail>[FAIL]</mark> <time>[' + this.#formatTime(endTime - startTime) + ']</time> ' + error.message);
			return false;
		}
	}

	#spaces(level) {
		return '  '.repeat(level);
	}

	start() {
		const startTime = new Date().getTime();
		const status = { success: 0, skip: 0, fail: 0 };
		const sb = [];
		let n = 0;
		this.#settings.include.forEach((className) => {
			sb.push(`<h1>${className.name}</h1>`);
			this.#checkAndTestIt(sb, className, 'beforeClass', 1);
			sb.push('');
			const propertyNames = Object.getOwnPropertyNames(className.prototype);
			propertyNames.forEach((propertyName) => {
				if (!className[propertyName]) {
					if (this.#isTestableMethod(propertyName)) {
						const testCases = className.data();
						const testCasesForMethod = testCases ? testCases[propertyName] : null;
						if (testCasesForMethod) {
							testCasesForMethod.forEach((testCase) => {
								n++;
								const testObject = this.#newInstance(sb, className, 2, n);
								let successBefore;
								if (testObject) {
									successBefore = this.#checkAndTestIt(sb, testObject, 'before', 2);
								} else {
									successBefore = false;
								}
								if (successBefore) {
									const success = this.#testIt(sb, testObject, propertyName, testCase, 2);
									success ? status.success++ : status.fail++;
									let successAfter = this.#checkAndTestIt(sb, testObject, 'after', 2);
									successAfter ? '' : status.fail++;
								} else {
									this.#skipIt(sb, testObject, propertyName, 2);
									status.skip++;
									this.#checkAndSkipIt(sb, testObject, 'after', 2);
								}
								sb.push('');
							});
						} else {
							n++;
							const testObject = this.#newInstance(sb, className, 2, n);
							let successBefore;
							if (testObject) {
								successBefore = this.#checkAndTestIt(sb, testObject, 'before', 2);
							} else {
								successBefore = false;
							}
							if (successBefore) {
								const success = this.#testIt(sb, testObject, propertyName, null, 2);
								success ? status.success++ : status.fail++;
								let successAfter = this.#checkAndTestIt(sb, testObject, 'after', 2);
								successAfter ? '' : status.fail++;
							} else {
								this.#skipIt(sb, testObject, propertyName, 2);
								status.skip++;
								this.#checkAndSkipIt(sb, testObject, 'after', 2);
							}
							sb.push('');
						}
					}
				}
			});
			this.#checkAndTestIt(sb, className, 'afterClass', 1);
			sb.push('');
			sb.push('');
		});
		const endTime = new Date().getTime();
		sb.push('<hr />');
		sb.push(`Tests: ${n} <time>[${this.#formatTime(endTime - startTime)}]</time>`);
		sb.push(` - success: ${status.success}`);
		sb.push(` - skip: ${status.skip}`);
		sb.push(` - fail: ${status.fail}`);
		sb.push('');
		sb.push(`Final status: ${this.#finalStatusTag(n, status)}`);
		if (this.#settings.output) {
			this.#settings.output.innerHTML = sb.join('<br />');
		} else {
			console.log(sb.join('\n'));
		}
	}

	#finalStatusTag(n, status) {
		if (n == status.success && status.fail == 0) {
			return '<mark success>[SUCCESS]</mark>';
		}
		return '<mark fail>[FAIL]</mark>';
	}

	static #show(obj) {
		if (typeof obj === 'string') {
			return obj.replace(/\n/g, '\\n');
		}
		return obj;
	}

	static #assert(obj, msg) {
		if (!obj) {
			throw new Error(msg);
		}
	}

	static assertTrue = function (obj) {
		JSus.#assert(obj === true, '[' + obj + '] should be [true]');
	};

	static assertFalse = function (obj) {
		JSus.#assert(obj === false, '[' + obj + '] should be [false]');
	};

	static assertNull = function (obj) {
		JSus.#assert(obj === null, '[' + obj + '] should be [null]');
	};

	static assertNotNull = function (obj) {
		JSus.#assert(obj !== null, '[' + obj + '] should not be [null]');
	};

	static assertUndefined = function (obj) {
		JSus.#assert(obj === undefined, '[' + obj + '] should be [undefined]');
	};

	static assertEquals = function (obj1, obj2) {
		JSus.#assert(obj1 === obj2, '[' + obj2 + '] should be equals to [' + JSus.#show(obj1) + ']');
	};

	static assertNotEquals = function (obj1, obj2) {
		JSus.#assert(obj1 !== obj2, '[' + obj2 + '] should not be equals to [' + JSus.#show(obj1) + ']');
	};

	static assertBetween = function (limInf, obj, limSup) {
		JSus.#assert(obj >= limInf && obj <= limSup, '[' + obj + '] should be between [' + limInf + '] and [' + limSup + '] inclusive');
	};

	static assertEndsWith = function (obj2, obj1) {
		JSus.#assert(new RegExp(obj1 + '$').test(obj2), '[' + obj2 + '] should ends with [' + obj1 + ']');
	};

	static assertStartsWith = function (obj2, obj1) {
		JSus.#assert(new RegExp('^' + obj1).test(obj2), '[' + obj2 + '] should starts with [' + obj1 + ']');
	};

}
