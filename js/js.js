(function () {

	const init = () => {
		new JSus({
			include: [
				ExampleTester,
			], output: document.getElementById('output')
		}).start();
	};

	window.addEventListener('load', init, false);

})();
