class ExampleTester {

	constructor() {
	}

	static data() {
		return {
			test1: [
				{ input: 1, expected: 1 },
				{ input: 2, expected: 2 },
			]
		};
	}

	static beforeClass() { }
	before() { }
	after() { }
	static afterClass() { }

	test1(input, expected) {
		const current = input;
		JSus.assertEquals(expected, current);
	}

	test2() {
		JSus.assertTrue(false);
	}

}
