describe("Cerealizer", function() {

	describe("Xml", function() {

		beforeEach(function() {
			this.serializer = new Cerealizer.Xml();
		});

		describe("_serialize", function() {

			it("converts a simple object", function() {
				var expected = ["<title>Testing</title>", "<price>29.99</price>"];

				var data = {
					title: "Testing",
					price: 29.99
				};

				var actual = this.serializer._serialize(data, []);

				expect(actual).toEqual(expected);
			});

			it("converts a nested object", function() {
				var data = {
					blog: {
						id: 123,
						title: "Testing"
					}
				};

				var expected = [
					"<blog>",
						"<id>123</id>",
						"<title>Testing</title>",
					"</blog>"
				];
				var actual = this.serializer._serialize(data, []);

				expect(actual).toEqual(expected);
			});

			it("escapes special characters", function() {
				var expected = [
					"<quote>&quot;9 &gt; 4,&quot; said the teacher.</quote>"
				];

				var data = {
					quote: '"9 > 4," said the teacher.'
				};

				var actual = this.serializer._serialize(data, []);

				expect(actual).toEqual(expected);
			});

			it("allows for xml namespaces", function() {
				var expected = [
					"<blog:post>",
						"<title>Testing</title>",
					"</blog:post>"
				];

				var data = {
					"blog:post": {
						title: "Testing"
					}
				};

				var actual = this.serializer._serialize(data, []);

				expect(actual).toEqual(expected);
			});

		});

	});

});
